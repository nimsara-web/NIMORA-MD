const config = require('../../config');

module.exports = {
    name: 'owner',
    aliases: ['creator'],
    category: 'main',
    description: 'Bot owner info',

    async execute(ctx) {
        const { reply, FOOTER } = ctx;

        await reply(`👑 *BOT OWNER*

> Name: *${config.ownerName}*
> Contact: *+${config.supportNumber}*
> Website: ${config.websiteUrl}
> Channel: ${config.channelLink}

💡 Need help? Contact the owner above!${FOOTER}`);
    }
};
