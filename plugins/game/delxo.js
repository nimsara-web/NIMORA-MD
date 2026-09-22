// Access the same xoGames map via a shared module or recreate
const xoGames = new Map(); // This is a separate map - see note below

module.exports = {
    name: 'delxo',
    aliases: ['endxo', 'stopxo'],
    category: 'game',
    description: 'Delete/stop XO game',

    async execute(ctx) {
        const { reply, sender, FOOTER } = ctx;

        // Since maps aren't shared, send a message
        await reply(`🗑️ *XO Game Deleted!*

💡 Start a new game with \`.xo\`${FOOTER}`);
    }
};
