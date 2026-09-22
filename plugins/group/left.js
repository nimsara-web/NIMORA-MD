module.exports = {
    name: 'left',
    aliases: ['leave', 'exit'],
    category: 'group',
    description: 'Bot leaves the group',

    async execute(ctx) {
        const { reply, socket, sender, isOwner, FOOTER } = ctx;
        if (!sender.endsWith('@g.us')) return reply(`⚠️ Group only!${FOOTER}`);
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        await reply(`👋 *Goodbye!*${FOOTER}`);
        setTimeout(async () => {
            try { await socket.groupLeave(sender); } catch (e) {}
        }, 2000);
    }
};
