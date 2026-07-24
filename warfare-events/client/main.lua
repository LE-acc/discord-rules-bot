--============================================================
--  WARFARE EVENTS — client
--  Opens the NUI panel on /events, relays data between the UI and the server.
--============================================================

local isOpen = false

-- Shows an in-game message through Config.Notify (your 'notify' script).
local function notify(msg, ntype)
    if Config.Notify then
        Config.Notify(msg, ntype)
    else
        SetNotificationTextEntry('STRING')
        AddTextComponentSubstringPlayerName(msg)
        DrawNotification(false, true)
    end
end

-- /events -> ask the server whether we're allowed, then open
RegisterCommand(Config.Command, function()
    if isOpen then return end
    TriggerServerEvent('warfare:canOpen')
end, false)

-- server's answer to canOpen
RegisterNetEvent('warfare:openResult', function(canOpen, isAdmin, user)
    if not canOpen then
        notify('You need the Event Host role to use this.', 'error')
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
            isAdmin    = isAdmin,
            categories = Config.Categories,
        }
    })
end)

-- data pushes -> forward to the UI
RegisterNetEvent('warfare:sendEvents', function(events)
    SendNUIMessage({ action = 'events', events = events })
end)

RegisterNetEvent('warfare:giveData', function(data)
    SendNUIMessage({ action = 'give', items = data.items, prizes = data.prizes, players = data.players })
end)

-- in-game notification
RegisterNetEvent('warfare:notify', function(msg, ntype)
    notify(msg, ntype)
end)

-- in-panel toast (shows while the panel is open)
RegisterNetEvent('warfare:toast', function(msg)
    SendNUIMessage({ action = 'toast', text = msg })
end)

--------------------------------------------------------------
-- NUI callbacks (browser -> client -> server)
--------------------------------------------------------------
RegisterNUICallback('getEvents', function(_, cb)
    TriggerServerEvent('warfare:requestEvents'); cb('ok')
end)

RegisterNUICallback('createEvent', function(data, cb)
    TriggerServerEvent('warfare:createEvent', data); cb('ok')
end)

RegisterNUICallback('getGive', function(_, cb)
    TriggerServerEvent('warfare:getGive'); cb('ok')
end)

RegisterNUICallback('savePrizes', function(data, cb)
    TriggerServerEvent('warfare:savePrizes', data); cb('ok')
end)

RegisterNUICallback('givePlayer', function(data, cb)
    TriggerServerEvent('warfare:givePlayer', data); cb('ok')
end)

RegisterNUICallback('close', function(_, cb)
    isOpen = false
    SetNuiFocus(false, false)
    cb('ok')
end)

-- safety: release focus if the resource stops while open
AddEventHandler('onResourceStop', function(res)
    if res == GetCurrentResourceName() and isOpen then
        SetNuiFocus(false, false)
    end
end)
