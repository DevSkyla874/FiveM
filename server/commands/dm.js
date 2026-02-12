/** Custom Command - Direct message a player */

module.exports = {
    name: "dm",
    description: "Send a private message to a player in-game",
    role: "mod",

    options: [
        {
            name: "id",
            description: "Player's server ID",
            required: true,
            type: "INTEGER",
        },
        {
            name: "message",
            description: "Message to send",
            required: true,
            type: "STRING",
        },
    ],

    run: async (client, interaction, args) => {
        if (!GetPlayerName(args.id)) return interaction.reply({ content: "This ID seems invalid.", ephemeral: true });
        const playerName = GetPlayerName(args.id);

        client.utils.chatMessage(args.id, "[Staff DM]", args.message, { color: [0, 200, 255] });

        TriggerClientEvent("ox_lib:notify", args.id, {
            title: "Staff Message",
            description: args.message,
            type: "info",
            duration: 8000,
        });

        return interaction.reply({ content: `Message sent to ${playerName} (${args.id}): ${args.message}`, ephemeral: false });
    },
};
