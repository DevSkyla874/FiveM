/** Custom Command - Unjail a player */

module.exports = {
    name: "unjail",
    description: "Release a player from jail",
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
        const player = client.QBCore.Functions.GetPlayer(args.id);
        if (!player) return interaction.reply({ content: "Player not found or not loaded.", ephemeral: true });

        // Set jail metadata to 0
        player.Functions.SetMetaData("injail", 0);

        // xt-prison: set jail time to 0 to release via compat event
        emitNet("prison:server:SetJailStatus", args.id, 0);

        client.utils.log.info(`[${interaction.member.displayName}] Unjailed ${playerName} (${args.id})`);

        if (client.z.log) {
            client.z.log.send("modlog", `**${interaction.member.displayName}** released **${playerName}** (${args.id}) from jail`, { color: "#2ecc71" });
        }

        return interaction.reply({ content: `${playerName} (${args.id}) has been released from jail.`, ephemeral: false });
    },
};
