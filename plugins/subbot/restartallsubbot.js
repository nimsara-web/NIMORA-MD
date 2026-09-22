const Session = require('../../Id');

module.exports = {
    name: 'restartallsubbot',
    aliases: ['restartall'],
    category: 'subbot',
    description: 'Restart all sub-bots',

    async execute(ctx) {
        const { reply, isMainOwner, activeSockets, number, FOOTER } = ctx;
        if (!isMainOwner) return reply(`⚠️ *Main Owner Only!*${FOOTER}`);

        await reply(`🔄 Restarting all sub-bots... ⏳${FOOTER}`);

        try {
            const all = await Session.find({});
            const { StartBot } = require('../../pair');

            for (const s of all) {
                if (s.number === number) continue;
                if (activeSockets.has(s.number)) {
                    try { await activeSockets.get(s.number).end(); } catch (e) {}
                    activeSockets.delete(s.number);
                }
            }

            setTimeout(async () => {
                for (const s of all) {
                    if (s.number === number) continue;
                    try { await StartBot(s.number, null, true); } catch (e) {}
                }
            }, 3000);

            await reply(`✅ *All sub-bots restarting!*${FOOTER}`);
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
