const Session = require('../../Id');

module.exports = {
    name: 'getsubbot',
    aliases: ['mysubbot', 'substatus'],
    category: 'subbot',
    description: 'Check your sub-bot status',

    async execute(ctx) {
        const { reply, senderNumber, activeSockets, FOOTER } = ctx;

        const clean = senderNumber.replace(/[^0-9]/g, '');
        const session = await Session.findOne({ number: clean });

        if (!session) {
            return reply(`❌ *No sub-bot found* for +${senderNumber}${FOOTER}`);
        }

        const isActive = activeSockets.has(clean);

        await reply(`🤖 *YOUR SUB-BOT*

📱 *Number:* +${senderNumber}
📊 *Status:* ${isActive ? '🟢 Active' : '🔴 Offline'}
📅 *Created:* ${session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'N/A'}${FOOTER}`);
    }
};
