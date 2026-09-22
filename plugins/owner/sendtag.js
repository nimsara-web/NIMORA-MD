module.exports = {
    name: 'sendtag',
    aliases: ['tagmsg'],
    category: 'owner',
    description: 'Tag all in a group (owner only)',

    async execute(ctx) {
        const { args, reply, socket, isOwner, sender, channelContext, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        const message = args.join(' ') || 'Attention everyone!';

        try {
            const meta = await socket.groupMetadata(sender);
            const mentions = meta.participants.map(p => p.id);

            let text = `📢 *${message}*\n\n`;
            meta.participants.forEach((p, i) => {
                text += `${i + 1}. @${p.id.split('@')[0]}\n`;
            });

            await socket.sendMessage(sender, {
                text: text + FOOTER,
                mentions,
                contextInfo: channelContext
            });
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
