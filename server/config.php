<?php
// server/config.php

return [
    'telegram' => [
        'bot_token' => 'YOUR_BOT_TOKEN_HERE',
        'chat_id' => 'YOUR_CHAT_ID_HERE',
    ],
    'logging' => [
        'enabled' => true,
        'log_file' => __DIR__ . '/logs/credentials.txt',
    ],
];
?>
