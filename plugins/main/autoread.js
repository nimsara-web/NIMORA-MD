module.exports = {
    name: 'autoread',
    category: 'main',
    description: 'Auto read messages',

    async execute(ctx) {
        const { args, reply, isOwner, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const option = args[0]?.toLowerCase();
        const valid = ['all', 'cmd', 'off'];

        if (!valid.includes(option)) {
            return reply(`👁️ *Auto-Read*\n\nCurrent: *${(global.autoReadStatus || 'off').toUpperCase()}*\n\n*Options:*\n• .autoread all\n• .autoread cmd\n• .autoread off${FOOTER}`);
        }

        global.autoReadStatus = option;
        await reply(`✅ Auto-Read: *${option.toUpperCase()}*${FOOTER}`);
    }
};
