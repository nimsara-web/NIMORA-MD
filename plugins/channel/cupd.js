const config = require('../../config');

module.exports = {
    name: 'cupd',
    aliases: ['channelupdate'],
    category: 'channel',
    description: 'Send update to channel (owner only)',

    async execute(ctx) {
        const { args, reply, isOwner, socket, channelContext, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .cupd [message]${FOOTER}`);

        try {
            await socket.sendMessage(config.channelJid, {
                text: `📢 *CHANNEL UPDATE*\n\n${text}\n\n> ${config.channelName}`,
                contextInfo: channelContext
            });
            await reply(`✅ Sent to channel!${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
