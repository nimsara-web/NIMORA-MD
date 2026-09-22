const config = require('../../config');

module.exports = {
    name: 'myenv',
    aliases: ['env', 'envs'],
    category: 'owner',
    description: 'Show environment config (masked)',

    async execute(ctx) {
        const { reply, isMainOwner, FOOTER } = ctx;
        if (!isMainOwner) return reply(`⚠️ *Main Owner Only!*${FOOTER}`);

        const mask = (str) => {
            if (!str) return 'not set';
            if (str.length < 8) return '***';
            return str.substring(0, 4) + '...' + str.substring(str.length - 4);
        };

        await reply(`⚙️ *ENVIRONMENT*

🔑 MONGO_URI: ${mask(process.env.MONGO_URI)}
🔑 NIM_API_KEY: ${mask(process.env.NIM_API_KEY)}
📞 OWNER_NUMBER: ${config.ownerNumber}
📢 CHANNEL_JID: ${config.channelJid}
🌐 WEBSITE: ${config.websiteUrl}
🤖 BOT_NAME: ${config.botName}
👤 OWNER_NAME: ${config.ownerName}${FOOTER}`);
    }
};
