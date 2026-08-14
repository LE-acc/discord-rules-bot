--[[
    نقطة الربط الوحيدة مع سكربت التفاعل حقك ("interact" أو غيره).
    كل ملفات الكلاينت الثانية تستدعي بس الدوال الثلاث تحت — ماتتعامل مع
    أي سكربت تفاعل مباشرة. يعني لو تبي تربط سكربتك، بدّل جسم الدوال
    الثلاث (AddEntityInteraction / RemoveEntityInteraction / AddZoneInteraction)
    باستدعاءات سكربتك، وخلاص، ماتحتاج تلمس floor.lua ولا warehouse.lua ولا غيرهم.

    شكل الـ options اللي توصل للدوال: array من
        { label = 'نص الخيار', icon = 'fa-solid fa-...', onSelect = function() ... end }

    حاليًا معبّاة بنظام احتياطي بسيط بالـ natives (بدون أي اعتمادية خارجية)
    عشان الريسورس يشتغل فورًا: يقرب اللاعب، يطلع نص فوق الرأس، يضغط G،
    ولو فيه أكثر من خيار توصله قائمة ox_lib. مفتاح G مربوط عن طريق
    RegisterKeyMapping فتقدر تغيّره من إعدادات الكيبورد بالعبة عادي.
]]

local entityZones = {} -- [entity] = options
local staticZones = {} -- list of { coords = vector3, radius = number, options = options }

local interactPressed = false
RegisterCommand('carshowroom_interact', function()
    interactPressed = true
end, false)
RegisterKeyMapping('carshowroom_interact', 'تفاعل - نظام المعارض', 'keyboard', 'G')

local function drawText3D(coords, text)
    local onScreen, x, y = World3dToScreen2d(coords.x, coords.y, coords.z)
    if not onScreen then return end
    SetTextScale(0.32, 0.32)
    SetTextFont(4)
    SetTextColour(255, 255, 255, 215)
    SetTextOutline()
    SetTextEntry('STRING')
    AddTextComponentString(text)
    DrawText(x, y)
end

local function showOptionsMenu(options)
    if #options == 0 then return end
    if #options == 1 then
        options[1].onSelect()
        return
    end
    local menuOptions = {}
    for _, o in ipairs(options) do
        table.insert(menuOptions, { title = o.label, icon = o.icon, onSelect = o.onSelect })
    end
    lib.registerContext({ id = 'carshowroom_interact_fallback', title = 'خيارات', options = menuOptions })
    lib.showContext('carshowroom_interact_fallback')
end

function AddEntityInteraction(entity, options)
    entityZones[entity] = options
end

function RemoveEntityInteraction(entity)
    entityZones[entity] = nil
end

function AddZoneInteraction(coords, radius, options)
    table.insert(staticZones, { coords = coords, radius = radius, options = options })
end

CreateThread(function()
    while true do
        local sleep = 500
        local ped = PlayerPedId()
        local pcoords = GetEntityCoords(ped)
        local nearestLabel, nearestOptions = nil, nil
        local nearestDist = 2.0

        for entity, options in pairs(entityZones) do
            if DoesEntityExist(entity) then
                local dist = #(pcoords - GetEntityCoords(entity))
                if dist <= nearestDist then
                    nearestDist = dist
                    nearestLabel = options[1] and options[1].label
                    nearestOptions = options
                    drawText3D(GetEntityCoords(entity) + vector3(0.0, 0.0, 1.0), '[G] ' .. (options[1] and options[1].label or 'تفاعل'))
                end
            end
        end

        for _, zone in ipairs(staticZones) do
            local dist = #(pcoords - zone.coords)
            if dist <= zone.radius then
                nearestOptions = zone.options
                drawText3D(zone.coords + vector3(0.0, 0.0, 1.0), '[G] ' .. (zone.options[1] and zone.options[1].label or 'تفاعل'))
            end
        end

        if nearestOptions then sleep = 0 end

        if interactPressed then
            interactPressed = false
            if nearestOptions then showOptionsMenu(nearestOptions) end
        end

        Wait(sleep)
    end
end)
