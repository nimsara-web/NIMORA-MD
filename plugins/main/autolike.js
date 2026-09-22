module.exports = {
    name: 'autolike',
    aliases: ['autostatuslike'],
    category: 'main',
    description: 'Auto like status',

    async execute(ctx) {
        const { args, reply, isOwner, handleSettingUpdate, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const val = args[0]?.toLowerCase();
        if (!val || !['on', 'off'].includes(val)) {
            return reply(`⚠️ Usage: .autolike on/off${FOOTER}`);
        }

        const normalized = val === 'on' ? 'true' : 'false';
        await handleSettingUpdate('AUTO_LIKE_STATUS', normalized, reply, ctx.number);
    }
};
