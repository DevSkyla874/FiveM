/** Custom Command - Clear a player's inventory */

module.exports = {
    name: "clearinventory",
    description: "Clear a player's entire inventory",
    role: "admin",

    options: [
        {
            name: "id",
            description: "Player's server ID",
            required: true,
            type: "INTEGER",
        },
    ],

    run: async (client, interaction, args) => {
        if (!GetPlayerName(args.id)) return interaction.reply({ content: "This ID seems invalid.", ephemeral: true });
        const playerName = GetPlayerName(args.id);

        try {
            global.exports["ox_inventory"].ClearInventory(args.id);
            client.utils.log.info(`[${interaction.member.displayName}] Cleared ${playerName}'s (${args.id}) inventory`);

            if (client.z.log) {
                client.z.log.send("adminlog", `**${interaction.member.displayName}** cleared **${playerName}** (${args.id})'s inventory`, { color: "#e74c3c" });
            }

            return interaction.reply({ content: `${playerName}'s (${args.id}) inventory has been cleared.`, ephemeral: false });
        } catch (e) {
            return interaction.reply({ content: `Failed to clear inventory: ${e.message || e}`, ephemeral: true });
        }
    },
};
