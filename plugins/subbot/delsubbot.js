const Session = require('../../Id');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: 'delsubbot',
    aliases: ['removesubbot'],
    category: 'subbot',
    description: 'Delete a sub-bot',

    async execute(ctx) {
        const { args, reply, isMainOwner, activeSockets, FOOTER } = ctx;

        const target = args[0]?.replace(/[^0-9]/g, '');
        if (!target) return reply(`⚠️ Usage: .delsubbot [number]${FOOTER}`);

        // Only main owner OR the user themselves
        const isSelf = target === ctx.senderNumber;
        if (!isMainOwner && !isSelf) {
            return reply(`⚠️ Only Main Owner!${FOOTER}`);
        }

        try {
            if (activeSockets.has(target)) {
                const sock = activeSockets.get(target);
                try { await sock.logout(); await sock.end(); } catch (e) {}
                activeSockets.delete(target);
            }

            await Session.deleteOne({ number: target });
            const sessionDir = path.join(__dirname, '../../sessions', `session_${target}`);
            await fs.remove(sessionDir).catch(() => {});

            await reply(`✅ *Sub-bot deleted:* +${target}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
