/** Custom Command - Clear world entities (props, vehicles, peds) */

const resourceName = GetCurrentResourceName();
const pendingClears = {};

onNet(`${resourceName}:clearResult`, (type, count) => {
    const src = global.source;
    if (pendingClears[src]) {
        pendingClears[src](type, count);
        delete pendingClears[src];
    }
});

module.exports = {
    name: "clear",
    description: "Clear world entities (props, vehicles, peds)",
    role: "admin",

    options: [
        {
            type: "SUB_COMMAND",
            name: "props",
            description: "Clear all props/objects nearby",
            options: [
                {
                    name: "id",
                    description: "Player ID to clear around (uses their location)",
                    required: true,
                    type: "INTEGER",
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "vehicles",
            description: "Clear all vehicles nearby",
            options: [
                {
                    name: "id",
                    description: "Player ID to clear around (uses their location)",
                    required: true,
                    type: "INTEGER",
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "peds",
            description: "Clear all NPC peds nearby",
            options: [
                {
                    name: "id",
                    description: "Player ID to clear around (uses their location)",
                    required: true,
                    type: "INTEGER",
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "all",
            description: "Clear all entities (props, vehicles, peds) nearby",
            options: [
                {
                    name: "id",
                    description: "Player ID to clear around (uses their location)",
                    required: true,
                    type: "INTEGER",
                },
            ],
        },
    ],

    run: async (client, interaction, args) => {
        if (!GetPlayerName(args.id)) return interaction.reply({ content: "This ID seems invalid.", ephemeral: true });
        await interaction.deferReply();

        if (args.all) {
            TriggerClientEvent(`${resourceName}:clearprops`, args.id);
            TriggerClientEvent(`${resourceName}:clearvehicles`, args.id);
            TriggerClientEvent(`${resourceName}:clearpeds`, args.id);
            client.utils.log.info(`[${interaction.member.displayName}] Cleared all entities near ${GetPlayerName(args.id)} (${args.id})`);
            return interaction.editReply({ content: `Clearing all entities near ${GetPlayerName(args.id)} (${args.id})...`, ephemeral: false });
        }

        const type = args.props ? "props" : args.vehicles ? "vehicles" : "peds";
        const event = `${resourceName}:clear${type}`;
        TriggerClientEvent(event, args.id);

        client.utils.log.info(`[${interaction.member.displayName}] Cleared ${type} near ${GetPlayerName(args.id)} (${args.id})`);
        return interaction.editReply({ content: `Clearing ${type} near ${GetPlayerName(args.id)} (${args.id})...`, ephemeral: false });
    },
};
