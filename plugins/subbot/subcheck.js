const Session = require('../../Id');

module.exports = {
    name: 'subcheck',
    category: 'subbot',
    description: 'Check sub-bot status',

    async execute(ctx) {
        const { args, reply, activeSockets, isMainOwner, number, FOOTER } = ctx;

        if (!isMainOwner) return reply(`⚠️ Only Main Owner!${FOOTER}`);

        const target = args[0]?.replace(/[^0-9]/g, '') || number;
        const session = await Session.findOne({ number: target });

        if (!session) return reply(`❌ No session for +${target}${FOOTER}`);

        const isActive = activeSockets.has(target);

        await reply(`🔍 *SUB-BOT CHECK*

📱 *Number:* +${target}
📊 *Status:* ${isActive ? '🟢 Active' : '🔴 Offline'}
📅 *Created:* ${session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'N/A'}
🕐 *Last Seen:* ${session.lastSeen ? new Date(session.lastSeen).toLocaleString() : 'N/A'}${FOOTER}`);
    }
};
