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
    name: "permissions",
    description: "Manage player's in-city permissions",
    role: "god",

    options: [
        {
            type: "SUB_COMMAND",
            name: "add",
            description: "add a permission to a player",
            options: [
                {
                    name: "id",
                    description: "Player's current id",
                    required: true,
                    type: "INTEGER",
                },
                {
                    name: "permission",
                    description: "permission to give",
                    required: true,
                    type: "STRING",
                    choices: [
                        { name: "admin", value: "admin" },
                        { name: "god", value: "god" },
                    ],
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "remove",
            description: "remove all permissions from a player",
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
        const ids = client.utils.getPlayerIdentifiers(args.id);
        const identifier = ids.license ? `license:${ids.license}` : (ids.discord ? `discord:${ids.discord}` : null);
        if (!identifier) return interaction.reply({ content: "Could not find a valid identifier for this player.", ephemeral: true });

        if (args.add) {
            // QBox uses ACE permissions - add principal for this session
            ExecuteCommand(`add_principal identifier.${identifier} qbx.${args.permission}`);
            client.utils.log.info(`[${interaction.member.displayName}] Gave ${GetPlayerName(args.id)} (${args.id}) the ${args.permission} permission`);
            return interaction.reply({ content: `${GetPlayerName(args.id)} (${args.id}) was given ${args.permission} permission (session only - add to permissions.cfg to persist).`, ephemeral: false });
        } else if (args.remove) {
            // Remove both admin and god principals
            ExecuteCommand(`remove_principal identifier.${identifier} qbx.admin`);
            ExecuteCommand(`remove_principal identifier.${identifier} qbx.god`);
            client.utils.log.info(`[${interaction.member.displayName}] Removed ${GetPlayerName(args.id)} (${args.id}) permissions`);
            return interaction.reply({ content: `${GetPlayerName(args.id)} (${args.id}) had their permissions removed (session only).`, ephemeral: false });
        }
    },
};
