<?php
declare(strict_types=1);

/*
 * WhatsApp automation - auth backend (PHP port of server.js).
 * Routes: GET /health, POST /api/auth/{signup,signin,forgot-password,reset-password}
 * Secrets live in a config file OUTSIDE the web root (see config.example.php).
 */

ini_set('display_errors', '0');
const WA_MAX_BODY = 20000;

function json_out(int $status, array $body): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(int $status, string $code, string $message): never
{
    json_out($status, ['error' => $code, 'message' => $message]);
}

set_exception_handler(function (Throwable $e): void {
    error_log('[whatsapp] ' . get_class($e) . ': ' . $e->getMessage());
    fail(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
});

function load_config(): array
{
    $root = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
    $candidates = array_filter([
        getenv('WHATSAPP_CONFIG') ?: null,
        $root !== '' ? dirname($root) . '/tmp-files/whatsapp-config.php' : null,
        __DIR__ . '/config.php',
    ]);
    foreach ($candidates as $file) {
        if (is_file($file) && is_readable($file)) {
            $cfg = require $file;
            if (is_array($cfg)) {
                return $cfg;
            }
        }
    }
    error_log('[whatsapp] config file not found; tried: ' . implode(', ', $candidates));
    fail(500, 'SERVER_MISCONFIGURED', 'Server is not configured.');
}

function db(array $cfg): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $dsn = sprintf(
        'pgsql:host=%s;port=%d;dbname=%s;sslmode=require',
        $cfg['db_host'],
        (int)($cfg['db_port'] ?? 5432),
        $cfg['db_name'] ?? 'postgres'
    );
    $pdo = new PDO($dsn, (string)$cfg['db_user'], (string)$cfg['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_TIMEOUT => 10,
    ]);
    return $pdo;
}

/** @return array{0:int,1:array} [httpStatus, decodedBody] */
function upscaleup(array $cfg, string $path, array $payload): array
{
    $ch = curl_init(rtrim((string)$cfg['upscaleup_base'], '/') . $path);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $cfg['upscaleup_key'],
            'Content-Type: application/json',
            'Accept: application/json',
        ],
    ]);
    $raw = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($raw === false) {
        throw new RuntimeException('UpScaleUp unreachable: ' . $err);
    }
    $data = json_decode((string)$raw, true);
    return [$status, is_array($data) ? $data : []];
}

function read_json(): array
{
    $raw = file_get_contents('php://input', false, null, 0, WA_MAX_BODY);
    $data = json_decode($raw === false ? '' : $raw, true);
    if (!is_array($data)) {
        fail(400, 'INVALID_JSON', 'Request body must be valid JSON.');
    }
    return $data;
}

function str(array $d, string $key): string
{
    $v = $d[$key] ?? '';
    return is_string($v) ? trim($v) : '';
}

function raw_str(array $d, string $key): string
{
    $v = $d[$key] ?? '';
    return is_string($v) ? $v : '';
}

function valid_password(string $p): bool
{
    return strlen($p) >= 8 && strlen($p) <= 72; // bcrypt ignores anything past 72 bytes
}

/* ------------------------------------------------------------------ */

function handle_signup(array $cfg): never
{
    $in = read_json();
    $name = str($in, 'name');
    $email = strtolower(str($in, 'email'));
    $password = raw_str($in, 'password');
    $phone = str($in, 'phone');
    $org = str($in, 'org_name');
    $tz = str($in, 'timezone');

    if ($name === '' || $email === '' || $password === '' || $tz === '') {
        fail(400, 'MISSING_FIELDS', 'name, email, password, and timezone are required');
    }
    if (strlen($name) > 255 || strlen($email) > 255 || strlen($org) > 255) {
        fail(400, 'FIELD_TOO_LONG', 'One of the fields is too long.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail(400, 'INVALID_EMAIL', 'Please provide a valid email address');
    }
    if (!valid_password($password)) {
        fail(400, 'WEAK_PASSWORD', 'Password must be between 8 and 72 characters long');
    }
    if (strlen($phone) > 20) {
        fail(400, 'INVALID_PHONE', 'Phone number is too long');
    }
    if (!in_array($tz, timezone_identifiers_list(), true)) {
        fail(400, 'INVALID_TIMEZONE', 'Please choose a valid timezone');
    }

    $pdo = db($cfg);
    $st = $pdo->prepare('SELECT id FROM public.users WHERE email = :email');
    $st->execute([':email' => $email]);
    if ($st->fetch()) {
        fail(409, 'USER_ALREADY_EXISTS', 'An account with this email already exists');
    }

    $externalId = 'usr_' . (int)(microtime(true) * 1000) . '_' . bin2hex(random_bytes(5));
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

    [$status, $data] = upscaleup($cfg, '/users', [
        'name' => $name,
        'email' => $email,
        'email_verified' => true,
        'org_name' => $org !== '' ? $org : 'Individual',
        'phone_no' => $phone !== '' ? $phone : null,
        'external_user_id' => $externalId,
        'timezone' => $tz,
    ]);
    if ($status < 200 || $status >= 300) {
        if (($data['error'] ?? '') === 'user_already_exists') {
            fail(409, 'USER_ALREADY_EXISTS', 'An account with this email already exists on UpScaleUp');
        }
        error_log('[whatsapp] UpScaleUp create user failed: HTTP ' . $status . ' ' . json_encode($data));
        fail(502, 'UPSTREAM_ERROR', 'We could not create your account right now. Please try again.');
    }

    try {
        $ins = $pdo->prepare(
            'INSERT INTO public.users
               (external_user_id, upscaleup_user_id, email, name, password_hash, phone, org_name, timezone, email_verified)
             VALUES (:ext, :up, :email, :name, :hash, :phone, :org, :tz, true)
             RETURNING id, external_user_id, email, name'
        );
        $ins->execute([
            ':ext' => $externalId,
            ':up' => isset($data['user_id']) ? (string)$data['user_id'] : null,
            ':email' => $email,
            ':name' => $name,
            ':hash' => $hash,
            ':phone' => $phone !== '' ? $phone : null,
            ':org' => $org !== '' ? $org : null,
            ':tz' => $tz,
        ]);
        $user = $ins->fetch();
    } catch (PDOException $e) {
        if ($e->getCode() === '23505') {
            fail(409, 'USER_ALREADY_EXISTS', 'An account with this email already exists');
        }
        error_log('[whatsapp] DB insert failed after UpScaleUp create (external_user_id=' . $externalId . '): ' . $e->getMessage());
        throw $e;
    }

    json_out(201, [
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'external_user_id' => $user['external_user_id'],
            'email' => $user['email'],
            'name' => $user['name'],
        ],
        'message' => 'Account created successfully',
    ]);
}

function handle_signin(array $cfg): never
{
    $in = read_json();
    $email = strtolower(str($in, 'email'));
    $password = raw_str($in, 'password');
    if ($email === '' || $password === '') {
        fail(400, 'MISSING_FIELDS', 'email and password are required');
    }

    $pdo = db($cfg);
    $st = $pdo->prepare('SELECT id, external_user_id, email, name, password_hash FROM public.users WHERE email = :email');
    $st->execute([':email' => $email]);
    $user = $st->fetch();

    if (!$user || !password_verify($password, (string)$user['password_hash'])) {
        fail(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }

    $pdo->prepare('UPDATE public.users SET last_login_at = CURRENT_TIMESTAMP WHERE id = :id')
        ->execute([':id' => $user['id']]);

    [$status, $data] = upscaleup($cfg, '/sso/login-url', ['external_user_id' => $user['external_user_id']]);
    if ($status < 200 || $status >= 300 || empty($data['login_url'])) {
        error_log('[whatsapp] UpScaleUp SSO failed: HTTP ' . $status . ' ' . json_encode($data));
        fail(502, 'SSO_ERROR', 'We could not sign you in right now. Please try again.');
    }

    json_out(200, [
        'success' => true,
        'user' => ['id' => $user['id'], 'email' => $user['email'], 'name' => $user['name']],
        'login_url' => $data['login_url'],
        'message' => 'Sign in successful',
    ]);
}

function handle_forgot(array $cfg): never
{
    $in = read_json();
    $email = strtolower(str($in, 'email'));
    if ($email === '') {
        fail(400, 'MISSING_EMAIL', 'email is required');
    }

    $pdo = db($cfg);
    $st = $pdo->prepare('SELECT id FROM public.users WHERE email = :email');
    $st->execute([':email' => $email]);
    $user = $st->fetch();

    if ($user) {
        $token = bin2hex(random_bytes(32));
        $pdo->prepare(
            "UPDATE public.users
                SET reset_token = :t, reset_token_expires = NOW() + INTERVAL '1 hour'
              WHERE id = :id"
        )->execute([':t' => hash('sha256', $token), ':id' => $user['id']]);

        // TODO: send this link by email (Brevo). Until then it is only logged.
        $base = rtrim((string)($cfg['frontend_url'] ?? ''), '/');
        error_log('[whatsapp] password reset link for ' . $email . ': ' . $base . '/reset-password?token=' . $token);
    }

    // Same answer whether or not the account exists (no user enumeration).
    json_out(200, ['success' => true, 'message' => 'If an account exists with this email, a reset link has been sent']);
}

function handle_reset(array $cfg): never
{
    $in = read_json();
    $token = str($in, 'token');
    $new = raw_str($in, 'newPassword');
    if ($token === '' || $new === '') {
        fail(400, 'MISSING_FIELDS', 'token and newPassword are required');
    }
    if (!valid_password($new)) {
        fail(400, 'WEAK_PASSWORD', 'Password must be between 8 and 72 characters long');
    }

    $pdo = db($cfg);
    $st = $pdo->prepare('SELECT id FROM public.users WHERE reset_token = :t AND reset_token_expires > NOW()');
    $st->execute([':t' => hash('sha256', $token)]);
    $user = $st->fetch();
    if (!$user) {
        fail(401, 'INVALID_TOKEN', 'Password reset token is invalid or expired');
    }

    $pdo->prepare(
        'UPDATE public.users
            SET password_hash = :h, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE id = :id'
    )->execute([':h' => password_hash($new, PASSWORD_BCRYPT, ['cost' => 10]), ':id' => $user['id']]);

    json_out(200, ['success' => true, 'message' => 'Password reset successfully']);
}

function handle_health(array $cfg): never
{
    if (isset($_GET['db'])) {
        db($cfg)->query('SELECT 1');
        json_out(200, ['ok' => true, 'db' => true]);
    }
    json_out(200, ['ok' => true]);
}

/* ------------------------------------------------------------------ */

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = (string)parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
$path = preg_replace('#^/WhatsApp#i', '', $path) ?? $path;
$path = rtrim($path, '/');
if ($path === '') {
    $path = '/';
}

$routes = [
    '/health' => ['GET', 'handle_health'],
    '/api/health' => ['GET', 'handle_health'],
    '/api/auth/signup' => ['POST', 'handle_signup'],
    '/api/auth/signin' => ['POST', 'handle_signin'],
    '/api/auth/forgot-password' => ['POST', 'handle_forgot'],
    '/api/auth/reset-password' => ['POST', 'handle_reset'],
];

if (!isset($routes[$path])) {
    fail(404, 'NOT_FOUND', 'Not found');
}
[$allowed, $handler] = $routes[$path];
if ($method !== $allowed) {
    header('Allow: ' . $allowed);
    fail(405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
}

$handler(load_config());
