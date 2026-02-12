/** Custom Command - Give a car to a player's garage */

module.exports = {
    name: "givecar",
    description: "Give a vehicle to a player's garage permanently",
    role: "god",

    options: [
        {
            name: "id",
            description: "Player's server ID",
            required: true,
            type: "INTEGER",
        },
        {
            name: "model",
            description: "Vehicle model name (e.g. adder, zentorno)",
            required: true,
            type: "STRING",
        },
        {
            name: "garage",
            description: "Garage to store in [Default: pillboxgarage]",
            required: false,
            type: "STRING",
        },
    ],

    run: async (client, interaction, args) => {
        if (!GetPlayerName(args.id)) return interaction.reply({ content: "This ID seems invalid.", ephemeral: true });
        const player = client.QBCore.Functions.GetPlayer(args.id);
        if (!player) return interaction.reply({ content: "Player not found or not loaded.", ephemeral: true });

        const playerName = GetPlayerName(args.id);
        const citizenId = player.PlayerData.citizenid;
        const license = player.PlayerData.license;
        const model = args.model.toLowerCase();
        const garage = args.garage || "pillboxgarage";

        // Generate a random plate
        const plate = ("QBX" + Math.random().toString(36).substring(2, 6)).toUpperCase().substring(0, 8);

        // Get vehicle hash
        const hash = GetHashKey(model);

        try {
            global.exports["oxmysql"].execute(
                "INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, garage, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [license, citizenId, model, hash, "{}", plate, garage, 1]
            );

            client.utils.log.info(`[${interaction.member.displayName}] Gave ${playerName} (${args.id}) a ${model} [Plate: ${plate}]`);

            if (client.z.log) {
                client.z.log.send("adminlog", `**${interaction.member.displayName}** gave **${playerName}** (${args.id}) a **${model}** [Plate: ${plate}, Garage: ${garage}]`, { color: "#3498db" });
            }

            return interaction.reply({ content: `Gave ${playerName} (${args.id}) a **${model}** (Plate: ${plate}) in ${garage}`, ephemeral: false });
        } catch (e) {
            return interaction.reply({ content: `Failed to give vehicle: ${e.message || e}`, ephemeral: true });
        }
    },
};
