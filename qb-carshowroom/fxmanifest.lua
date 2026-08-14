fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'qb-carshowroom'
author 'built for le-acc'
description 'Multi-dealership vehicle showroom system (QBCore + ox_lib + ox_target + oxmysql)'
version '1.0.0'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/permissions.lua',
    'config.lua',
}

client_scripts {
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
    'ox_target',
    'oxmysql',
}
