module.exports = {
    name: 'gdesc',
    aliases: ['groupdesc'],
    category: 'group',
    description: 'Change group description',

    async execute(ctx) {
        const { args, reply, socket, sender, FOOTER } = ctx;
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        const desc = args.join(' ');
        if (!desc) return reply(`⚠️ Usage: .gdesc [description]${FOOTER}`);

        try {
            await socket.groupUpdateDescription(sender, desc);
            await reply(`✅ Description updated!${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
