const config = require('../../config');

// Lazy require to avoid circular dependency
function getPair() {
    return require('../../pair');
}

module.exports = {
    name: 'runtime',
    aliases: ['uptime'],
    category: 'main',
    description: 'Bot uptime',

    async execute(ctx) {
        const { number, reply, FOOTER } = ctx;

        // ✅ Get socketCreationTime directly from pair module
        const pair = getPair();
        const socketCreationTime = pair.socketCreationTime || new Map();

        const botName = (await ctx.get('BOT_NAME', number)) || config.botName;
        const start = socketCreationTime.get(number) || Date.now();
        const uptime = Math.floor((Date.now() - start) / 1000);
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = Math.floor(uptime % 60);

        await reply(`⏱️ *${botName} Uptime:* ${h}h ${m}m ${s}s${FOOTER}`);
    }
};
