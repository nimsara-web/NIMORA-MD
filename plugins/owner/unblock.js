/**
 * NIMORA MD - Unblock User
 * Category: owner
 * 
 * Unblock a user.
 * BOT OWNER + MAIN OWNER.
 */

const { readJson, writeJson } = require('./_helper');

module.exports = {
    name: 'unblock',
    aliases: ['unbanuser'],
    category: 'owner',
    description: 'Unblock a user (owner only)',

    async execute(ctx) {
        const {
            args, reply, isOwner, isMainOwner, socket, msg,
            senderNumber, FOOTER
        } = ctx;

        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*${FOOTER}`);
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        let target;

        if (quoted?.participant) {
            target = quoted.participant;
        } else if (args[0]) {
            const num = args[0].replace(/[^0-9]/g, '');
            if (!num || num.length < 9) {
                return reply(`⚠️ *Invalid number!*${FOOTER}`);
            }
            target = `${num}@s.whatsapp.net`;
        } else {
            return reply(`⚠️ *Reply to a user or provide a number!*${FOOTER}`);
        }

        try {
            await socket.updateBlockStatus(target, 'unblock');

            const banned = await readJson('banned.json', { users: [] });
            banned.users = banned.users.filter(u => u !== target);
            await writeJson('banned.json', banned);

            await reply(`✅ *Unblocked*

👤 ${target.split('@')[0]}
🕐 ${new Date().toLocaleString()}${FOOTER}`);

            console.log(`[UNBLOCK] ${target} unblocked by ${senderNumber}`);
        } catch (e) {
            console.error('[UNBLOCK] Error:', e.message);
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
