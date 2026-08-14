local function usedFloorSlots(dealership)
    local rows = MySQL.query.await('SELECT floor_slot FROM carshowroom_listings WHERE dealership = ? AND floor_slot IS NOT NULL', { dealership })
    local used = {}
    for _, r in ipairs(rows) do used[r.floor_slot] = true end
    return used
end

local function usedWarehouseSlots(dealership)
    local rows = MySQL.query.await("SELECT warehouse_slot FROM carshowroom_units WHERE dealership = ? AND location = 'warehouse'", { dealership })
    local used = {}
    for _, r in ipairs(rows) do used[r.warehouse_slot] = true end
    return used
end

local function firstFreeIndex(usedSet, maxIndex)
    for i = 1, maxIndex do
        if not usedSet[i] then return i end
    end
    return nil
end

--- All units currently sitting in the warehouse, one row per physical unit ---
QBCore.Functions.CreateCallback('carshowroom:server:getWarehouseUnits', function(source, cb, dealership)
    local rows = MySQL.query.await([[
        SELECT u.id, u.warehouse_slot, u.mods_json, l.label, l.vehicle_model, l.class
        FROM carshowroom_units u
        JOIN carshowroom_listings l ON l.id = u.listing_id
        WHERE u.dealership = ? AND u.location = 'warehouse'
    ]], { dealership })
    cb(rows)
end)

--- Everything waiting in a truck that hasn't been unloaded yet ---
QBCore.Functions.CreateCallback('carshowroom:server:getTruckManifest', function(source, cb, dealership)
    local rows = MySQL.query.await([[
        SELECT u.id, l.label, l.vehicle_model
        FROM carshowroom_units u
        JOIN carshowroom_listings l ON l.id = u.listing_id
        WHERE u.dealership = ? AND u.location = 'truck'
    ]], { dealership })
    cb(rows)
end)

--- Unload the next truck unit into the first open warehouse grid slot ---
QBCore.Functions.CreateCallback('carshowroom:server:unloadUnit', function(source, cb, dealership)
    if not PlayerHasPermission(source, dealership, Permissions.BUY_STOCK) and not PlayerHasPermission(source, dealership, Permissions.MANAGE_FLOOR) then
        return cb(false, 'ماعندك صلاحية')
    end

    local config = Config.Dealerships[dealership]
    local maxSlots = config.warehouse.gridColumns * config.warehouse.gridRows
    local slot = firstFreeIndex(usedWarehouseSlots(dealership), maxSlots)
    if not slot then return cb(false, 'المخزن ممتلئ') end

    local unit = MySQL.single.await("SELECT u.*, l.vehicle_model, l.label FROM carshowroom_units u JOIN carshowroom_listings l ON l.id = u.listing_id WHERE u.dealership = ? AND u.location = 'truck' LIMIT 1", { dealership })
    if not unit then return cb(false, 'الشاحنة فاضية') end

    MySQL.update.await("UPDATE carshowroom_units SET location = 'warehouse', warehouse_slot = ? WHERE id = ?", { slot, unit.id })
    RecalculateListingCounts(unit.listing_id)

    cb(true, {
        slot = slot,
        model = unit.vehicle_model,
        label = unit.label,
        modsJson = unit.mods_json,
    })
end)

--- Move one warehouse unit onto the sales floor for its listing ---
QBCore.Functions.CreateCallback('carshowroom:server:moveToFloor', function(source, cb, dealership, listingId)
    if not PlayerHasPermission(source, dealership, Permissions.MANAGE_FLOOR) then return cb(false, 'ماعندك صلاحية') end

    local listing = MySQL.single.await('SELECT * FROM carshowroom_listings WHERE id = ? AND dealership = ?', { listingId, dealership })
    if not listing then return cb(false, 'غير موجود') end

    local unit = MySQL.single.await("SELECT * FROM carshowroom_units WHERE listing_id = ? AND location = 'warehouse' LIMIT 1", { listingId })
    if not unit then return cb(false, 'ماعندك مخزون بالمخزن لهذي السيارة') end

    local config = Config.Dealerships[dealership]
    local slotIndex = listing.floor_slot
    local isNewSlot = false
    if not slotIndex then
        slotIndex = firstFreeIndex(usedFloorSlots(dealership), #config.floorSlots)
        if not slotIndex then return cb(false, 'كل أماكن العرض مشغولة') end
        isNewSlot = true
        MySQL.update.await('UPDATE carshowroom_listings SET floor_slot = ? WHERE id = ?', { slotIndex, listingId })
    end

    MySQL.update.await("UPDATE carshowroom_units SET location = 'floor', warehouse_slot = NULL WHERE id = ?", { unit.id })
    RecalculateListingCounts(listingId)

    TriggerClientEvent('carshowroom:client:floorRestocked', -1, dealership, listingId, slotIndex, listing.vehicle_model, isNewSlot)
    cb(true, 'تم العرض بالمعرض')
end)
