module.exports = {
    name: 'invite',
    aliases: ['grouplink', 'linkgc'],
    category: 'group',
    description: 'Get group invite link',

    async execute(ctx) {
        const { reply, socket, sender, FOOTER } = ctx;
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        try {
            const code = await socket.groupInviteCode(sender);
            await reply(`🔗 *Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
