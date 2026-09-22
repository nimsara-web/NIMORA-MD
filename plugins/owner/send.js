module.exports = {
    name: 'send',
    aliases: ['sendmsg', 'msg'],
    category: 'owner',
    description: 'Send message to a number/group',

    async execute(ctx) {
        const { args, reply, socket, isOwner, channelContext, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const target = args[0];
        const message = args.slice(1).join(' ');

        if (!target || !message) {
            return reply(`⚠️ Usage: .send [number/jid] [message]${FOOTER}`);
        }

        let jid = target;
        if (/^[0-9]+$/.test(target)) jid = `${target}@s.whatsapp.net`;
        if (target.endsWith('@g.us')) jid = target;

        try {
            await socket.sendMessage(jid, {
                text: message,
                contextInfo: channelContext
            });
            await reply(`✅ *Message sent to* \`${jid}\`${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
