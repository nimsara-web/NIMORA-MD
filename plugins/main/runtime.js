const config = require('../../config');

module.exports = {
    name: 'runtime',
    aliases: ['uptime'],
    category: 'main',
    description: 'Bot uptime',

    async execute(ctx) {
        const { number, socketCreationTime, reply, FOOTER } = ctx;

        const botName = (await ctx.get('BOT_NAME', number)) || config.botName;
        const start = socketCreationTime.get(number) || Date.now();
        const uptime = Math.floor((Date.now() - start) / 1000);
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = Math.floor(uptime % 60);

        await reply(`⏱️ *${botName} Uptime:* ${h}h ${m}m ${s}s${FOOTER}`);
    }
};
