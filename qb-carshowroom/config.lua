Config = {}

-- All coordinates below are PLACEHOLDERS. Walk your server, grab real
-- coords (F8 -> `/coords` or similar) and replace every vector before going live.

Config.Dealerships = {
    ['muzaffar'] = {
        label = 'معرض المظفر للمركبات',
        type = 'cars',
        class = 'luxury',
        society = 'muzaffar_dealership', -- qb-banking/qb-management account name
        blip = { sprite = 225, color = 5, scale = 0.8 },
        entrance = vector4(-56.0, -1097.0, 26.4, 30.0),

        -- Sales floor: a fixed pool of physical spawn slots. Only ONE vehicle
        -- is ever spawned per active listing here; the server assigns/frees a
        -- slot as a listing's floor_stock goes above/back to zero.
        floorSlots = {
            vector4(-60.0, -1093.0, 26.4, 30.0),
            vector4(-64.0, -1090.0, 26.4, 30.0),
            vector4(-68.0, -1087.0, 26.4, 30.0),
            vector4(-72.0, -1084.0, 26.4, 30.0),
            vector4(-76.0, -1081.0, 26.4, 30.0),
            vector4(-80.0, -1078.0, 26.4, 30.0),
        },

        -- Owner/staff sales terminal (laptop prop) location, and where the
        -- truck-dispensing ped stands.
        laptop = vector4(-52.0, -1100.0, 26.4, 30.0),
        truckPed = vector4(-48.0, -1105.0, 26.4, 200.0),
        truckModel = `speedo`,
        truckUpgradeCost = 15000, -- one-time cost to fit the flatbed/hitch rig that lets the truck actually secure cargo

        -- Warehouse reuses a hangar interior as vehicle storage, laid out as
        -- a grid so units can be dropped in one at a time and still line up.
        warehouse = {
            entrance = vector4(-56.0, -1097.0, 26.4, 30.0), -- interaction point that teleports into the interior/apartment shell
            interiorCoords = vector4(-1657.0, -3125.0, 5.4, 30.0), -- inside the reused hangar shell
            dropPoint = vector4(-1670.0, -3110.0, 5.4, 30.0), -- where the truck unloads next to
            gridOrigin = vector3(-1690.0, -3140.0, 5.4),
            gridSpacingX = 4.0,
            gridSpacingY = 6.0,
            gridColumns = 8,
            gridRows = 6, -- 48 slots
        },

        modChance = 0.35, -- Muzaffar-only: chance a restocked unit rolls random performance/visual mods
        wholesale = {
            { model = 'zentorno', label = 'Progen Zentorno', price = 420000 },
            { model = 'osiris', label = 'Pegassi Osiris', price = 480000 },
            { model = 'entityxf', label = 'Overflod Entity XF', price = 390000 },
            { model = 'adder', label = 'Truffade Adder', price = 500000 },
        },
    },

    ['sandyshore'] = {
        label = 'معرض ساندي شور للمركبات',
        type = 'cars',
        class = 'standard',
        society = 'sandyshore_dealership',
        blip = { sprite = 225, color = 2, scale = 0.8 },
        entrance = vector4(1734.0, 3707.0, 34.2, 210.0),

        floorSlots = {
            vector4(1730.0, 3703.0, 34.2, 210.0),
            vector4(1726.0, 3699.0, 34.2, 210.0),
            vector4(1722.0, 3695.0, 34.2, 210.0),
            vector4(1718.0, 3691.0, 34.2, 210.0),
        },

        laptop = vector4(1738.0, 3711.0, 34.2, 210.0),
        truckPed = vector4(1742.0, 3715.0, 34.2, 20.0),
        truckModel = `speedo`,
        truckUpgradeCost = 8000,

        warehouse = {
            entrance = vector4(1734.0, 3707.0, 34.2, 210.0),
            interiorCoords = vector4(-1657.0, -3125.0, 5.4, 30.0),
            dropPoint = vector4(-1670.0, -3110.0, 5.4, 30.0),
            gridOrigin = vector3(-1690.0, -3160.0, 5.4), -- separate warehouse "bay" so the two dealerships never overlap stock visually
            gridSpacingX = 4.0,
            gridSpacingY = 6.0,
            gridColumns = 8,
            gridRows = 4,
        },

        modChance = 0, -- Sandy Shore stock is always stock, no random mods
        wholesale = {
            { model = 'sultan', label = 'Karin Sultan', price = 22000 },
            { model = 'blista', label = 'Dinka Blista', price = 14000 },
            { model = 'asea', label = 'Declasse Asea', price = 12000 },
            { model = 'primo', label = 'Albany Primo', price = 15000 },
        },
    },

    ['alkutub'] = {
        label = 'معرض الكتب للدراجات النارية',
        type = 'bikes',
        class = 'bike',
        society = 'alkutub_dealership',
        blip = { sprite = 226, color = 1, scale = 0.8 },
        entrance = vector4(-1180.0, -1442.0, 4.5, 120.0),

        floorSlots = {
            vector4(-1176.0, -1446.0, 4.5, 120.0),
            vector4(-1172.0, -1450.0, 4.5, 120.0),
            vector4(-1168.0, -1454.0, 4.5, 120.0),
        },

        laptop = vector4(-1184.0, -1438.0, 4.5, 120.0),
        truckPed = vector4(-1188.0, -1434.0, 4.5, 300.0),
        truckModel = `speedo`,
        truckUpgradeCost = 5000,

        warehouse = {
            entrance = vector4(-1180.0, -1442.0, 4.5, 120.0),
            interiorCoords = vector4(-1657.0, -3125.0, 5.4, 30.0),
            dropPoint = vector4(-1670.0, -3110.0, 5.4, 30.0),
            gridOrigin = vector3(-1690.0, -3180.0, 5.4),
            gridSpacingX = 3.0,
            gridSpacingY = 4.0,
            gridColumns = 10,
            gridRows = 3,
        },

        modChance = 0,
        wholesale = {
            { model = 'akuma', label = 'Dinka Akuma', price = 9000 },
            { model = 'bati', label = 'Pegassi Bati 801', price = 11000 },
            { model = 'sanchez', label = 'Maibatsu Sanchez', price = 6000 },
        },
    },
}

-- Test-drive vehicles are NOT drawn from any dealership's stock: they're
-- spawned fresh, cost nothing, and damage to them never touches the owner's
-- money or inventory. See server/testdrive.lua.
Config.TestDrive = {
    durationMs = 3 * 60 * 1000, -- 3 minutes
    spawnOffset = vector3(4.0, 0.0, 0.0), -- relative to the dealership entrance
}
