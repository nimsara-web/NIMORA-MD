module.exports = {
    name: 'autoview',
    aliases: ['autostatusview'],
    category: 'main',
    description: 'Auto view status',

    async execute(ctx) {
        const { args, reply, isOwner, handleSettingUpdate, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const val = args[0]?.toLowerCase();
        if (!val || !['on', 'off'].includes(val)) {
            return reply(`⚠️ Usage: .autoview on/off${FOOTER}`);
        }

        const normalized = val === 'on' ? 'true' : 'false';
        await handleSettingUpdate('AUTO_VIEW_STATUS', normalized, reply, ctx.number);
    }
};
