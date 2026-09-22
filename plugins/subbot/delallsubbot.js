const Session = require('../../Id');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: 'delallsubbot',
    aliases: ['removellsubbot'],
    category: 'subbot',
    description: 'Delete all sub-bots (main owner only)',

    async execute(ctx) {
        const { args, reply, isMainOwner, activeSockets, number, FOOTER } = ctx;
        if (!isMainOwner) return reply(`⚠️ *Main Owner Only!*${FOOTER}`);

        if (args[0] !== 'confirm') {
            return reply(`⚠️ *DANGER!* This deletes ALL sub-bots!

*Usage:* \`.delallsubbot confirm\`${FOOTER}`);
        }

        try {
            for (const [num, sock] of activeSockets) {
                if (num === number) continue; // skip current bot
                try { await sock.logout(); await sock.end(); } catch (e) {}
            }

            // Delete all sessions except current
            const all = await Session.find({});
            for (const s of all) {
                if (s.number === number) continue;
                await Session.deleteOne({ number: s.number });
                await fs.remove(path.join(__dirname, '../../sessions', `session_${s.number}`)).catch(() => {});
            }

            await reply(`✅ *All sub-bots deleted!*${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
