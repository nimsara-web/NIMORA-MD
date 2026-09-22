const config = require('../../config');

module.exports = {
    name: 'mode',
    category: 'main',
    description: 'Change bot mode',

    async execute(ctx) {
        const { args, reply, number, isOwner, handleSettingUpdate, get, FOOTER } = ctx;

        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const option = args[0]?.toLowerCase();
        const validModes = ['public', 'group', 'inbox', 'private'];

        if (!validModes.includes(option)) {
            const current = (await get('BOT_MODE', number)) || config.defaultMode;
            return reply(`⚙️ *Bot Mode*\n\n📊 *Current:* ${current.toUpperCase()}\n\n*Options:*\n• .mode public\n• .mode group\n• .mode inbox\n• .mode private${FOOTER}`);
        }

        await handleSettingUpdate('BOT_MODE', option, reply, number);
    }
};
