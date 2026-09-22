const config = require('../../config');

module.exports = {
    name: 'reset',
    category: 'owner',
    description: 'Reset all bot settings',

    async execute(ctx) {
        const { args, reply, isMainOwner, number, input, FOOTER } = ctx;
        if (!isMainOwner) return reply(`⚠️ *Main Owner Only!*${FOOTER}`);

        const confirm = args[0]?.toLowerCase();
        if (confirm !== 'confirm') {
            return reply(`⚠️ *DANGER!*

This will reset ALL settings to default!

*Usage:* \`.reset confirm\`${FOOTER}`);
        }

        const keys = [
            'PREFIX', 'BOT_NAME', 'BOT_MODE', 'AUTO_VIEW_STATUS',
            'AUTO_LIKE_STATUS', 'ALWAYS_ONLINE', 'AUTOREPLY_MODE', 'AUTOREPLY_LIST'
        ];

        for (const key of keys) {
            await input(key, '', number).catch(() => {});
        }

        await reply(`✅ *All settings reset to default!*${FOOTER}`);
    }
};
