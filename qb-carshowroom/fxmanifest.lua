fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'qb-carshowroom'
author 'built for le-acc'
description 'Multi-dealership vehicle showroom system (QBCore + ox_lib + oxmysql)'
version '1.0.0'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/permissions.lua',
    'config.lua',
}

client_scripts {
    'client/interact_bridge.lua', -- swap this file's 3 functions for your "interact" script's API; nothing else needs to change
    'client/floor.lua',
    'client/warehouse.lua',
    'client/truck.lua',
    'client/testdrive.lua',
    'client/laptop.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/floor.lua',
    'server/warehouse.lua',
    'server/truck.lua',
    'server/testdrive.lua',
    'server/employees.lua',
    'server/finance.lua',
}

dependencies {
    'qb-core',
    'ox_lib',
    'oxmysql',
    -- your "interact" script isn't listed here since we don't know its resource
    -- name; add it once client/interact_bridge.lua is wired to it.
}
