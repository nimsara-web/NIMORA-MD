const Session = require('../../Id');

module.exports = {
    name: 'restartsubbot',
    category: 'subbot',
    description: 'Restart a sub-bot',

    async execute(ctx) {
        const { args, reply, isMainOwner, activeSockets, FOOTER } = ctx;
        if (!isMainOwner) return reply(`⚠️ *Main Owner Only!*${FOOTER}`);

        const target = args[0]?.replace(/[^0-9]/g, '');
        if (!target) return reply(`⚠️ Usage: .restartsubbot [number]${FOOTER}`);

        const session = await Session.findOne({ number: target });
        if (!session) return reply(`❌ No session found!${FOOTER}`);

        try {
            if (activeSockets.has(target)) {
                const sock = activeSockets.get(target);
                try { await sock.end(); } catch (e) {}
                activeSockets.delete(target);
            }

            const { StartBot } = require('../../pair');
            setTimeout(() => StartBot(target, null, true), 2000);

            await reply(`🔄 *Restarting sub-bot:* +${target}${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
