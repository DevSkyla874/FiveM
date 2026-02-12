/** Custom Command - Set a player's ped model */

module.exports = {
    name: "setped",
    description: "Change a player's ped model",
    role: "admin",

    options: [
        {
            name: "id",
            description: "Player's server ID",
            required: true,
            type: "INTEGER",
        },
        {
            name: "model",
            description: "Ped model name (e.g. a_m_m_farmer_01, s_m_y_cop_01)",
            required: true,
            type: "STRING",
        },
    ],

    run: async (client, interaction, args) => {
        if (!GetPlayerName(args.id)) return interaction.reply({ content: "This ID seems invalid.", ephemeral: true });
        const playerName = GetPlayerName(args.id);

        TriggerClientEvent(`${GetCurrentResourceName()}:setped`, args.id, args.model);

        client.utils.log.info(`[${interaction.member.displayName}] Set ${playerName}'s (${args.id}) ped to ${args.model}`);
        return interaction.reply({ content: `Set ${playerName}'s (${args.id}) ped model to **${args.model}**`, ephemeral: false });
    },
};
