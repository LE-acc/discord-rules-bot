QBCore = exports['qb-core']:GetCoreObject()

FloorVehicles = {} -- [dealership][slotIndex] = entity
Listings = {} -- [dealership][listingId] = row

local function spawnFloorVehicle(dealership, slotIndex, model)
    local existing = FloorVehicles[dealership] and FloorVehicles[dealership][slotIndex]
    if existing and DoesEntityExist(existing) then return end

    local config = Config.Dealerships[dealership]
    local coords = config.floorSlots[slotIndex]
    if not coords then return end

    lib.requestModel(model)
    local veh = CreateVehicle(model, coords.x, coords.y, coords.z, coords.w, false, false)
    SetEntityAsMissionEntity(veh, true, true)
    FreezeEntityPosition(veh, true)
    SetVehicleOnGroundProperly(veh)
    SetVehicleDoorsLocked(veh, 2)
    SetEntityInvincible(veh, true)

    FloorVehicles[dealership] = FloorVehicles[dealership] or {}
    FloorVehicles[dealership][slotIndex] = veh

    AddEntityInteraction(veh, {
        {
            icon = 'fa-solid fa-car',
            label = 'الاطلاع على السيارة',
            onSelect = function()
                OpenFloorVehicleMenu(dealership, slotIndex)
            end,
        },
    })
end

local function despawnFloorVehicle(dealership, slotIndex)
    local veh = FloorVehicles[dealership] and FloorVehicles[dealership][slotIndex]
    if veh and DoesEntityExist(veh) then
        RemoveEntityInteraction(veh)
        DeleteEntity(veh)
    end
    if FloorVehicles[dealership] then FloorVehicles[dealership][slotIndex] = nil end
end

local function refreshDealership(dealership)
    local rows = lib.callback.await('carshowroom:server:getListings', false, dealership)
    Listings[dealership] = {}
    for _, row in ipairs(rows) do
        Listings[dealership][row.id] = row
        if row.floor_slot then
            spawnFloorVehicle(dealership, row.floor_slot, row.vehicle_model)
        end
    end
end

function OpenFloorVehicleMenu(dealership, slotIndex)
    local listing
    for _, row in pairs(Listings[dealership] or {}) do
        if row.floor_slot == slotIndex then listing = row break end
    end
    if not listing then return end

    local options = {
        {
            title = listing.label,
            description = ('السعر: $%s | الفئة: %s | المتبقي: %s\n%s'):format(listing.retail_price, listing.class, listing.floor_stock, listing.description or ''),
            icon = 'fa-solid fa-circle-info',
            disabled = true,
        },
        {
            title = 'شراء السيارة',
            icon = 'fa-solid fa-dollar-sign',
            onSelect = function()
                local ok, msg = lib.callback.await('carshowroom:server:buyVehicle', false, dealership, listing.id)
                QBCore.Functions.Notify(msg, ok and 'success' or 'error')
            end,
        },
    }

    if listing.allow_testdrive == 1 then
        table.insert(options, {
            title = 'تجربة قيادة',
            icon = 'fa-solid fa-key',
            onSelect = function()
                RequestTestDrive(dealership, listing.id)
            end,
        })
    end

    lib.registerContext({ id = 'carshowroom_floor_menu', title = listing.label, options = options })
    lib.showContext('carshowroom_floor_menu')
end

CreateThread(function()
    for id, config in pairs(Config.Dealerships) do
        local blip = AddBlipForCoord(config.entrance.x, config.entrance.y, config.entrance.z)
        SetBlipSprite(blip, config.blip.sprite)
        SetBlipColour(blip, config.blip.color)
        SetBlipScale(blip, config.blip.scale)
        SetBlipAsShortRange(blip, true)
        BeginTextCommandSetBlipName('STRING')
        AddTextComponentString(config.label)
        EndTextCommandSetBlipName(blip)

        refreshDealership(id)
    end
end)

RegisterNetEvent('carshowroom:client:floorRestocked', function(dealership, listingId, slotIndex, model, isNewSlot)
    refreshDealership(dealership)
end)

RegisterNetEvent('carshowroom:client:vehicleSold', function(dealership, listingId, freedSlot)
    refreshDealership(dealership)
    if freedSlot then despawnFloorVehicle(dealership, freedSlot) end
end)

RegisterNetEvent('carshowroom:client:deliverVehicle', function(dealership, model, plate, modsJson)
    local config = Config.Dealerships[dealership]
    local coords = config.entrance
    lib.requestModel(model)
    local veh = CreateVehicle(model, coords.x + 3.0, coords.y + 3.0, coords.z, coords.w, true, false)
    SetEntityAsMissionEntity(veh, true, true)
    SetVehicleOnGroundProperly(veh)

    if modsJson and modsJson ~= '{}' then
        local mods = json.decode(modsJson)
        SetVehicleModKit(veh, 0)
        if mods.engine then SetVehicleMod(veh, 11, mods.engine, false) end
        if mods.brakes then SetVehicleMod(veh, 12, mods.brakes, false) end
        if mods.transmission then SetVehicleMod(veh, 13, mods.transmission, false) end
        if mods.turbo then ToggleVehicleMod(veh, 18, true) end
        if mods.wheels then SetVehicleMod(veh, 23, mods.wheels, false) end
        if mods.color1 then SetVehicleColours(veh, mods.color1, mods.color2 or mods.color1) end
        if mods.windowTint then SetVehicleWindowTint(veh, mods.windowTint) end
    end

    SetVehicleNumberPlateText(veh, plate)
    TriggerEvent('vehiclekeys:client:SetOwner', plate)

    TaskWarpPedIntoVehicle(PlayerPedId(), veh, -1)
    QBCore.Functions.Notify('السيارة جاهزة وباسمك، المفتاح معك', 'success')
end)
