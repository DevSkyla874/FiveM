/** Custom Command - Warn a player */

module.exports = {
    name: "warn",
    description: "Warn a player with a reason",
    role: "mod",

    options: [
        {
            name: "id",
            description: "Player's server ID",
            required: true,
            type: "INTEGER",
        },
        {
            name: "reason",
            description: "Reason for the warning",
            required: true,
            type: "STRING",
        },
    ],

    run: async (client, interaction, args) => {
        if (!GetPlayerName(args.id)) return interaction.reply({ content: "This ID seems invalid.", ephemeral: true });
        const playerName = GetPlayerName(args.id);
        const staffName = interaction.member.displayName;

        // Notify the player in-game
        client.utils.chatMessage(args.id, "WARNING", `You have been warned by staff: ${args.reason}`, { color: [255, 0, 0] });

        // Notification via ox_lib if available
        TriggerClientEvent("ox_lib:notify", args.id, {
            title: "Warning",
            description: `You have been warned: ${args.reason}`,
            type: "error",
            duration: 10000,
        });

        client.utils.log.info(`[${staffName}] Warned ${playerName} (${args.id}): ${args.reason}`);

        // Log to modlog webhook
        if (client.z.log) {
            client.z.log.send("modlog", `**${staffName}** warned **${playerName}** (${args.id})\n**Reason:** ${args.reason}`, { color: "#ffa500" });
        }

        return interaction.reply({ content: `${playerName} (${args.id}) has been warned: ${args.reason}`, ephemeral: false });
    },
};
