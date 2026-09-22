const { readJson, writeJson } = require('./_helper');

module.exports = {
    name: 'unblock',
    category: 'owner',
    description: 'Unblock a user',

    async execute(ctx) {
        const { args, reply, isOwner, socket, msg, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        const target = quoted?.participant || (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);

        if (!target) return reply(`⚠️ Reply to a user or provide number!${FOOTER}`);

        try {
            await socket.updateBlockStatus(target, 'unblock');
            const banned = await readJson('banned.json', { users: [] });
            banned.users = banned.users.filter(u => u !== target);
            await writeJson('banned.json', banned);

            await reply(`✅ *Unblocked:* ${target.split('@')[0]}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
