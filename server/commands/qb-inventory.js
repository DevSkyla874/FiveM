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
    name: "inventory",
    description: "Manage player's in-city items",
    role: "admin",

    options: [
        {
            type: "SUB_COMMAND",
            name: "give",
            description: "give a player an item",
            options: [
                {
                    name: "id",
                    description: "Player's current id",
                    required: true,
                    type: "INTEGER",
                },
                {
                    name: "item",
                    description: "item to give",
                    required: true,
                    type: "STRING",
                },
                {
                    name: "count",
                    description: "how many to give [Default: 1]",
                    required: false,
                    type: "INTEGER",
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "take",
            description: "take an item away from a player",
            options: [
                {
                    name: "id",
                    description: "Player's current id",
                    required: true,
                    type: "INTEGER",
                },
                {
                    name: "item",
                    description: "item to take",
                    required: true,
                    type: "STRING",
                },
                {
                    name: "count",
                    description: "how many to take [Default: 1]",
                    required: false,
                    type: "INTEGER",
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "inspect",
            description: "Peek inside player's inventory",
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
        const amount = args.count || 1;
        if (!GetPlayerName(args.id)) return interaction.reply({ content: "This ID seems invalid.", ephemeral: true });
        const playerName = GetPlayerName(args.id);
        const itemName = args.item ? args.item.toLowerCase() : null;

        if (args.give) {
            const success = global.exports["ox_inventory"].AddItem(args.id, itemName, amount);
            if (success) {
                client.utils.log.info(`[${interaction.member.displayName}] gave ${playerName} (${args.id}) ${amount} ${itemName}`);
                return interaction.reply({ content: `${playerName} (${args.id}) was given ${amount}x ${itemName}`, ephemeral: false });
            } else {
                return interaction.reply({ content: `Failed to give item. Check the item name is correct: \`${itemName}\``, ephemeral: false });
            }
        } else if (args.take) {
            const success = global.exports["ox_inventory"].RemoveItem(args.id, itemName, amount);
            if (success) {
                client.utils.log.info(`[${interaction.member.displayName}] removed ${amount} ${itemName} from ${playerName}'s (${args.id}) inventory`);
                return interaction.reply({ content: `${amount}x ${itemName} has been taken from ${playerName} (${args.id})`, ephemeral: false });
            } else {
                return interaction.reply({ content: `Failed to remove item. Player may not have enough \`${itemName}\``, ephemeral: false });
            }
        } else if (args.inspect) {
            const embed = new client.Embed().setTitle(`${playerName}'s (${args.id}) Inventory`);
            const items = global.exports["ox_inventory"].GetInventoryItems(args.id, false);
            let desc = "";
            if (items) {
                const entries = Array.isArray(items) ? items.filter(Boolean) : Object.values(items).filter(Boolean);
                entries.forEach((i) => {
                    if (i && i.name) desc += `[${i.slot}] ${i.count || i.amount || 1}x - **${i.label || i.name}** (${i.name})\n`;
                });
            }
            embed.setDescription(desc || "Inventory is empty");
            return interaction.reply({ embeds: [ embed ], ephemeral: false });
        }

    },
};
