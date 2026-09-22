module.exports = {
    name: 'unmute',
    aliases: ['open'],
    category: 'group',
    description: 'Unmute group',

    async execute(ctx) {
        const { reply, socket, sender, FOOTER } = ctx;
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        try {
            await socket.groupSettingUpdate(sender, 'not_announcement');
            await reply(`🔊 *Group unmuted* (everyone can send)${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
