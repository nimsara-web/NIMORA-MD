module.exports = {
    name: 'alwaysonline',
    aliases: ['online'],
    category: 'main',
    description: 'Always online presence',

    async execute(ctx) {
        const { args, reply, isOwner, handleSettingUpdate, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const val = args[0]?.toLowerCase();
        if (!val || !['on', 'off'].includes(val)) {
            return reply(`⚠️ Usage: .alwaysonline on/off${FOOTER}`);
        }

        const normalized = val === 'on' ? 'true' : 'false';
        await handleSettingUpdate('ALWAYS_ONLINE', normalized, reply, ctx.number);
    }
};
