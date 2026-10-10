<?php
/*
 * TEMPLATE ONLY - contains no real secrets.
 *
 * On the server, create the REAL file OUTSIDE the web root, at:
 *   <app folder>/tmp-files/whatsapp-config.php
 * (the folder that sits next to app-html), and fill in the values below.
 * Never commit the real file.
 */
return [
    'db_host' => 'db.YOUR-PROJECT-REF.supabase.co',
    'db_port' => 5432,
    'db_name' => 'postgres',
    'db_user' => 'postgres',
    'db_pass' => 'CHANGE_ME',

    'upscaleup_base' => 'https://upscaleup.io/api/partner/v1',
    'upscaleup_key'  => 'CHANGE_ME',

    'frontend_url'   => 'https://whatsapp.aitamate.com',
];
