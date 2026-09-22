module.exports = {
    name: 'nodelet',
    aliases: ['nodelete', 'antidelete'],
    category: 'main',
    description: 'Auto resend deleted messages',

    async execute(ctx) {
        const { args, reply, number, sender, isOwner, socket, msg, get, handleSettingUpdate, FOOTER } = ctx;

        // Group: admin only | Inbox: owner only
        if (sender.endsWith('@g.us')) {
            let isAdmin = msg.key.fromMe;
            if (!isAdmin) {
                try {
                    const meta = await socket.groupMetadata(sender);
                    const p = meta.participants.find(x => x.id === msg.key.participant);
                    isAdmin = p?.admin === 'admin' || p?.admin === 'superadmin';
                } catch (e) {}
            }
            if (!isAdmin) return reply(`⚠️ Only group admins or bot owner!${FOOTER}`);
        } else {
            if (!isOwner) return reply(`⚠️ Only Bot Owner can use this in Inbox!${FOOTER}`);
        }

        const val = args[0]?.toLowerCase();
        const current = (await get(`NODELETE_${sender}`, number)) || 'off';

        if (!val || !['on', 'off'].includes(val)) {
            return reply(`🗑️ *NODELETE STATUS*

📊 *Current:* ${current === 'on' ? '✅ ON' : '❌ OFF'}
📍 *Chat:* This ${sender.endsWith('@g.us') ? 'Group' : 'Inbox'}

*Usage:*
• \`.nodelet on\` - Auto resend deleted msgs
• \`.nodelet off\` - Disable${FOOTER}`);
        }

        await handleSettingUpdate(`NODELETE_${sender}`, val, reply, number);
    }
};
