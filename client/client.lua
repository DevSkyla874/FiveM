--[[
 - This file is part of zdiscord.
 - Copyright (C) 2021 Tony/zfbx
 - source: <https://github.com/zfbx/zdiscord>
 -
 - This work is licensed under the Creative Commons
 - Attribution-NonCommercial-ShareAlike 4.0 International License.
 - To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/
 - or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
--]]

local resourceName = GetCurrentResourceName()

RegisterNetEvent(resourceName..':kill', function()
    SetEntityHealth(PlayerPedId(), 0)
end)

RegisterNetEvent(resourceName..':teleport', function(x, y, z, withVehicle)
    x = tonumber(x)
    y = tonumber(y)
    z = tonumber(z)
    if (withVehicle) then
        SetPedCoordsKeepVehicle(PlayerPedId(), x, y, z)
    else
        SetEntityCoords(PlayerPedId(), x, y, z);
    end
end)

RegisterNetEvent(resourceName..':setped', function(model)
    local hash = joaat(model)
    RequestModel(hash)
    local timeout = 0
    while not HasModelLoaded(hash) and timeout < 100 do
        Wait(10)
        timeout = timeout + 1
    end
    if HasModelLoaded(hash) then
        SetPlayerModel(PlayerId(), hash)
        SetModelAsNoLongerNeeded(hash)
    end
end)

RegisterNetEvent(resourceName..':clearprops', function()
    local coords = GetEntityCoords(PlayerPedId())
    local objects = GetGamePool('CObject')
    local count = 0
    for _, obj in ipairs(objects) do
        if #(GetEntityCoords(obj) - coords) < 300.0 then
            DeleteEntity(obj)
            count = count + 1
        end
    end
    TriggerServerEvent(resourceName..':clearResult', 'props', count)
end)

RegisterNetEvent(resourceName..':clearvehicles', function()
    local coords = GetEntityCoords(PlayerPedId())
    local vehicles = GetGamePool('CVehicle')
    local count = 0
    for _, veh in ipairs(vehicles) do
        if #(GetEntityCoords(veh) - coords) < 300.0 and not IsPedInVehicle(PlayerPedId(), veh, false) then
            DeleteEntity(veh)
            count = count + 1
        end
    end
    TriggerServerEvent(resourceName..':clearResult', 'vehicles', count)
end)

RegisterNetEvent(resourceName..':clearpeds', function()
    local coords = GetEntityCoords(PlayerPedId())
    local peds = GetGamePool('CPed')
    local count = 0
    for _, ped in ipairs(peds) do
        if #(GetEntityCoords(ped) - coords) < 300.0 and not IsPedAPlayer(ped) then
            DeleteEntity(ped)
            count = count + 1
        end
    end
    TriggerServerEvent(resourceName..':clearResult', 'peds', count)
end)

RegisterNetEvent(resourceName..':cleanvehicle', function()
    local ped = PlayerPedId()
    local veh = GetVehiclePedIsIn(ped, false)
    if veh ~= 0 then
        SetVehicleDirtLevel(veh, 0.0)
        SetVehicleUndriveable(veh, false)
        WashDecalsFromVehicle(veh, 1.0)
    end
end)

function serverOnly()
    print("[ERROR] The triggered event can only be run on the server.")
end

exports('isRolePresent', serverOnly)
exports('getDiscordId', serverOnly)
exports('getRoles', serverOnly)
exports('getName', serverOnly)
exports('log', serverOnly)
