module.exports = {
    name: 'hidetag',
    aliases: ['ht', 'silenttag'],
    category: 'group',
    description: 'Tag all silently',

    async execute(ctx) {
        const { args, reply, socket, sender, msg, channelContext, FOOTER } = ctx;

        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        try {
            const meta = await socket.groupMetadata(sender);
            const message = args.join(' ') || '‎';
            const mentions = meta.participants.map(p => p.id);

            await socket.sendMessage(sender, {
                text: message + FOOTER,
                mentions,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
