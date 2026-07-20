--============================================================
--  WARFARE EVENTS — client
--  Opens the NUI panel on /events, relays data between the UI and the server.
--============================================================

local isOpen = false

-- simple on-screen notification
local function notify(msg)
    SetNotificationTextEntry('STRING')
    AddTextComponentSubstringPlayerName(msg)
    DrawNotification(false, true)
end

-- /events -> ask the server whether we're allowed, then open
RegisterCommand(Config.Command, function()
    if isOpen then return end
    TriggerServerEvent('warfare:canOpen')
end, false)

-- server's answer to canOpen
RegisterNetEvent('warfare:openResult', function(allowed, user)
    if not allowed then
        notify('~r~Warfare Events~s~\nYou need the Event Host role to use this.')
        return
    end
    isOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'open',
        config = {
            panelTitle = Config.PanelTitle,
            serverName = Config.ServerName,
            logo       = Config.Logo ~= '' and Config.Logo or nil,
            user       = user,
            categories = Config.Categories,
        }
    })
end)

-- server pushes the current events list -> forward to the UI
RegisterNetEvent('warfare:sendEvents', function(events)
    SendNUIMessage({ action = 'events', events = events })
end)

-- server confirms a post (or reports a problem)
RegisterNetEvent('warfare:notify', function(msg)
    notify(msg)
end)

--------------------------------------------------------------
-- NUI callbacks (browser -> client)
--------------------------------------------------------------

RegisterNUICallback('getEvents', function(_, cb)
    TriggerServerEvent('warfare:requestEvents')
    cb('ok')
end)

RegisterNUICallback('createEvent', function(data, cb)
    TriggerServerEvent('warfare:createEvent', data)
    cb('ok')
end)

RegisterNUICallback('close', function(_, cb)
    isOpen = false
    SetNuiFocus(false, false)
    cb('ok')
end)

-- safety: close the panel if the resource stops while open
AddEventHandler('onResourceStop', function(res)
    if res == GetCurrentResourceName() and isOpen then
        SetNuiFocus(false, false)
    end
end)
