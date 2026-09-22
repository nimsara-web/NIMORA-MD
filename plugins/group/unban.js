const { readJson, writeJson } = require('../owner/_helper');

module.exports = {
    name: 'unban',
    category: 'group',
    description: 'Unban a user',

    async execute(ctx) {
        const { reply, isOwner, msg, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.participant) return reply(`⚠️ Reply to a user!${FOOTER}`);

        const banned = await readJson('banned.json', { users: [] });
        banned.users = banned.users.filter(u => u !== quoted.participant);
        await writeJson('banned.json', banned);

        await reply(`✅ Unbanned: @${quoted.participant.split('@')[0]}${FOOTER}`);
    }
};
