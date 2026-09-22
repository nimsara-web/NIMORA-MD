module.exports = {
    name: 'tagall',
    aliases: ['all', 'everyone'],
    category: 'group',
    description: 'Tag all group members',

    async execute(ctx) {
        const { args, reply, socket, sender, msg, channelContext, FOOTER } = ctx;

        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        try {
            const meta = await socket.groupMetadata(sender);
            const customMsg = args.join(' ') || 'Attention everyone!';
            const mentions = meta.participants.map(p => p.id);

            let text = `📢 *${customMsg}*\n\n`;
            meta.participants.forEach((p, i) => {
                text += `${i + 1}. @${p.id.split('@')[0]}\n`;
            });

            await socket.sendMessage(sender, {
                text: text + FOOTER,
                mentions,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
