const { readJson, writeJson } = require('./_helper');

module.exports = {
    name: 'block',
    category: 'owner',
    description: 'Block a user',

    async execute(ctx) {
        const { args, reply, isOwner, socket, msg, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        const target = quoted?.participant || (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);

        if (!target) return reply(`⚠️ Reply to a user or provide number!${FOOTER}`);

        try {
            await socket.updateBlockStatus(target, 'block');
            const banned = await readJson('banned.json', { users: [] });
            if (!banned.users.includes(target)) banned.users.push(target);
            await writeJson('banned.json', banned);

            await reply(`🚫 *Blocked:* ${target.split('@')[0]}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
