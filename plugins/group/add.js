module.exports = {
    name: 'add',
    aliases: ['adduser'],
    category: 'group',
    description: 'Add user to group',

    async execute(ctx) {
        const { args, reply, socket, sender, FOOTER } = ctx;
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        const num = args[0]?.replace(/[^0-9]/g, '');
        if (!num) return reply(`⚠️ Usage: .add [number]${FOOTER}`);

        try {
            await socket.groupParticipantsUpdate(sender, [`${num}@s.whatsapp.net`], 'add');
            await reply(`✅ Added: +${num}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
