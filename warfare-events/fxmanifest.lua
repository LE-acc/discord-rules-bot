fx_version 'cerulean'
game 'gta5'

author 'Warfare Events'
description 'Discord-connected server events panel (opens with /events, role-gated, posts an embed to Discord)'
version '1.0.0'

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/logo.svg',
}

shared_script 'config.lua'
client_script 'client/main.lua'
server_script 'server/main.lua'
