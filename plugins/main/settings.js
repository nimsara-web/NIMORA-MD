const config = require('../../config');

module.exports = {
    name: 'settings',
    aliases: ['config'],
    category: 'main',
    description: 'Show bot settings',

    async execute(ctx) {
        const { number, reply, get, FOOTER } = ctx;

        const pfx = (await get('PREFIX', number)) || config.defaultPrefix;
        const bName = (await get('BOT_NAME', number)) || config.botName;
        const autoView = (await get('AUTO_VIEW_STATUS', number)) || 'true';
        const autoLike = (await get('AUTO_LIKE_STATUS', number)) || 'true';
        const alwaysOnline = (await get('ALWAYS_ONLINE', number)) || 'true';
        const mode = (await get('BOT_MODE', number)) || config.defaultMode;

        await reply(`⚙️ *${bName} SETTINGS*

> Owner: *${config.ownerName}*
> Bot Name: *${bName}*
> Prefix: *${pfx}*
> Mode: *${mode.toUpperCase()}*
> Auto View: *${autoView}*
> Auto Like: *${autoLike}*
> Always Online: *${alwaysOnline}*

🛠️ *Commands:*
• ${pfx}mode [public/group/inbox/private]
• ${pfx}autoview [on/off]
• ${pfx}autolike [on/off]
• ${pfx}alwaysonline [on/off]
• ${pfx}setprefix [prefix]
• ${pfx}autoread [all/cmd/off]
• ${pfx}autoreply [all/inbox/group/off]${FOOTER}`);
    }
};
