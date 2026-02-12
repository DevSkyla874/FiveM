/** Custom Command - Teleport player to predefined locations */

const locations = {
    "mrpd": { label: "Mission Row PD", x: 440.085, y: -974.924, z: 30.689 },
    "pillbox": { label: "Pillbox Hospital", x: 307.89, y: -595.12, z: 43.28 },
    "sandyshores": { label: "Sandy Shores PD", x: 1853.87, y: 3688.95, z: 34.26 },
    "paletopd": { label: "Paleto Bay PD", x: -448.22, y: 6013.9, z: 31.71 },
    "airport": { label: "LS Airport", x: -1037.73, y: -2737.93, z: 20.17 },
    "legion": { label: "Legion Square", x: 195.17, y: -933.77, z: 30.69 },
    "cityhall": { label: "City Hall", x: -540.23, y: -213.37, z: 38.22 },
    "pdm": { label: "Premium Deluxe Motorsport", x: -56.49, y: -1096.37, z: 26.42 },
    "lscustoms": { label: "LS Customs (Burton)", x: -337.09, y: -136.87, z: 39.01 },
    "maze": { label: "Maze Bank Tower", x: -75.0, y: -818.0, z: 326.17 },
    "casino": { label: "Diamond Casino", x: 924.43, y: 46.15, z: 81.1 },
    "prison": { label: "Bolingbroke Prison", x: 1845.39, y: 2585.98, z: 45.67 },
    "pier": { label: "Del Perro Pier", x: -1659.99, y: -1015.74, z: 13.02 },
    "gallery": { label: "Vangelico Jewelry", x: -630.42, y: -236.7, z: 38.08 },
    "pacific": { label: "Pacific Standard Bank", x: 235.28, y: 216.43, z: 106.29 },
    "fleeca": { label: "Fleeca Bank (Legion)", x: 149.63, y: -1042.65, z: 29.37 },
    "dynasty8": { label: "Dynasty 8 Office", x: -706.67, y: -913.03, z: 19.22 },
    "cab": { label: "Downtown Cab Co.", x: 895.35, y: -179.23, z: 74.7 },
};

const locationChoices = Object.entries(locations).map(([key, val]) => ({ name: val.label, value: key }));
// Discord limits to 25 choices max - we're under that
const choices = locationChoices.slice(0, 25);

module.exports = {
    name: "customtp",
    description: "Teleport a player to a predefined location",
    role: "mod",

    options: [
        {
            name: "id",
            description: "Player's server ID",
            required: true,
            type: "INTEGER",
        },
        {
            name: "location",
            description: "Location to teleport to",
            required: true,
            type: "STRING",
            choices: choices,
        },
    ],

    run: async (client, interaction, args) => {
        if (!GetPlayerName(args.id)) return interaction.reply({ content: "This ID seems invalid.", ephemeral: true });
        const loc = locations[args.location];
        if (!loc) return interaction.reply({ content: "Unknown location.", ephemeral: true });

        TriggerClientEvent(`${GetCurrentResourceName()}:teleport`, args.id, loc.x, loc.y, loc.z, true);

        client.utils.log.info(`[${interaction.member.displayName}] Teleported ${GetPlayerName(args.id)} (${args.id}) to ${loc.label}`);
        return interaction.reply({ content: `Teleported ${GetPlayerName(args.id)} (${args.id}) to **${loc.label}**`, ephemeral: false });
    },
};
