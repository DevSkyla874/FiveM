/**
 * This file is part of zdiscord.
 * Copyright (C) 2021 Tony/zfbx
 * source: <https://github.com/zfbx/zdiscord>
 *
 * This work is licensed under the Creative Commons
 * Attribution-NonCommercial-ShareAlike 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/
 * or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 */

module.exports = {
    name: "jail",
    description: "Manage a player's jail sentence",
    role: "mod",

    options: [
        {
            type: "SUB_COMMAND",
            name: "sentence",
            description: "place player in jail",
            options: [
                {
                    name: "id",
                    description: "Player's current id",
                    required: true,
                    type: "INTEGER",
                },
                {
                    name: "time",
                    description: "How long in minutes to jail player for",
                    required: true,
                    type: "INTEGER",
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "free",
            description: "free player from jail",
            options: [
                {
                    name: "id",
                    description: "Player's current id",
                    required: true,
                    type: "INTEGER",
                },
            ],
        },
    ],

    run: async (client, interaction, args) => {
        if (!GetPlayerName(args.id)) return interaction.reply({ content: "This ID seems invalid.", ephemeral: true });
        if (args.sentence) {
            if (args.time < 5) return interaction.reply({ content: "Jail time needs to be more than 5 minutes", ephemeral: true });

            // Set jail metadata via QBCore bridge
            const player = client.QBCore.Functions.GetPlayer(args.id);
            if (player) {
                player.Functions.SetMetaData("injail", args.time);
            }

            // xt-prison: use the compat server event to jail
            emitNet("prison:server:SetJailStatus", args.id, parseInt(args.time));

            // Notify player via ox_lib
            TriggerClientEvent("ox_lib:notify", args.id, {
                title: "Jailed",
                description: `You were sent to prison for ${args.time} months`,
                type: "error",
            });

            client.utils.log.info(`[${interaction.member.displayName}] jailed ${GetPlayerName(args.id)} (${args.id}) for ${args.time} months`);
            return interaction.reply({ content: `${GetPlayerName(args.id)} (${args.id}) was jailed for ${args.time} months.`, ephemeral: false });
        } else if (args.free) {
            // xt-prison: set jail time to 0 to free
            emitNet("prison:server:SetJailStatus", args.id, 0);

            // Also clear metadata
            const player = client.QBCore.Functions.GetPlayer(args.id);
            if (player) {
                player.Functions.SetMetaData("injail", 0);
            }

            client.utils.log.info(`[${interaction.member.displayName}] freed ${GetPlayerName(args.id)} (${args.id}) from jail`);
            return interaction.reply({ content: `${GetPlayerName(args.id)} (${args.id}) was set free`, ephemeral: false });
        }
    },
};
