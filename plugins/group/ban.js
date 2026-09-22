const { readJson, writeJson } = require('../owner/_helper');

module.exports = {
    name: 'ban',
    category: 'group',
    description: 'Ban user (bot-wide)',

    async execute(ctx) {
        const { reply, isOwner, msg, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.participant) return reply(`⚠️ Reply to a user!${FOOTER}`);

        const banned = await readJson('banned.json', { users: [] });
        if (!banned.users.includes(quoted.participant)) {
            banned.users.push(quoted.participant);
            await writeJson('banned.json', banned);
        }

        await reply(`🚫 Banned: @${quoted.participant.split('@')[0]}${FOOTER}`);
    }
};
