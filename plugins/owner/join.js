module.exports = {
    name: 'join',
    aliases: ['joingroup'],
    category: 'owner',
    description: 'Join a group via invite link',

    async execute(ctx) {
        const { args, reply, isOwner, socket, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const link = args[0];
        if (!link || !link.includes('chat.whatsapp.com')) {
            return reply(`⚠️ Usage: .join [group invite link]${FOOTER}`);
        }

        try {
            const code = link.split('/').pop();
            await socket.groupAcceptInvite(code);
            await reply(`✅ *Joined group!*${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
