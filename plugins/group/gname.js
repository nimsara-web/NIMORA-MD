module.exports = {
    name: 'gname',
    aliases: ['groupsubject'],
    category: 'group',
    description: 'Change group name',

    async execute(ctx) {
        const { args, reply, socket, sender, FOOTER } = ctx;
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);

        const name = args.join(' ');
        if (!name) return reply(`⚠️ Usage: .gname [new name]${FOOTER}`);

        try {
            await socket.groupUpdateSubject(sender, name);
            await reply(`✅ Group name updated!${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
