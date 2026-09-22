module.exports = {
    name: 'mute',
    aliases: ['close'],
    category: 'group',
    description: 'Mute group (admins only)',

    async execute(ctx) {
        const { reply, socket, sender, FOOTER } = ctx;
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        try {
            await socket.groupSettingUpdate(sender, 'announcement');
            await reply(`🔇 *Group muted* (only admins can send)${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
