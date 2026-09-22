/**
 * NIMORA MD - NoDelete (Anti-Delete) Toggle
 * Category: main
 * 
 * Toggle auto-resend of deleted messages per chat.
 * - Groups: admin or bot owner
 * - Inbox: bot owner only
 */

module.exports = {
    name: 'nodelet',
    aliases: ['nodelete', 'antidelete'],
    category: 'main',
    description: 'Auto resend deleted messages',

    async execute(ctx) {
        const {
            args, reply, number, sender, isOwner, socket, msg,
            get, handleSettingUpdate, FOOTER
        } = ctx;

        // ==========================================
        // 🔑 PERMISSION CHECK
        // ==========================================
        if (sender.endsWith('@g.us')) {
            let isAdmin = msg.key.fromMe;
            if (!isAdmin) {
                try {
                    const meta = await socket.groupMetadata(sender);
                    const p = meta.participants.find(x => x.id === msg.key.participant);
                    isAdmin = p?.admin === 'admin' || p?.admin === 'superadmin';
                } catch (e) {}
            }
            if (!isAdmin && !isOwner) {
                return reply(`⚠️ *Admin Only!*

Only group admins or bot owner can use this.${FOOTER}`);
            }
        } else {
            if (!isOwner) {
                return reply(`⚠️ *Owner Only!*

Only bot owner can use this in Inbox.${FOOTER}`);
            }
        }

        const val = args[0]?.toLowerCase();
        const chatJid = sender;

        // Get current status
        const current = (await get(`NODELETE_${chatJid}`, number)) || 'off';

        // ==========================================
        // 📊 SHOW STATUS (no args)
        // ==========================================
        if (!val || !['on', 'off'].includes(val)) {
            return reply(`🗑️ *NODELETE STATUS*

📊 *Current:* ${current === 'on' ? '✅ ON' : '❌ OFF'}
📍 *Chat:* This ${sender.endsWith('@g.us') ? 'Group' : 'Inbox'}

*Usage:*
• \`.nodelet on\` - Enable auto-resend
• \`.nodelet off\` - Disable

💡 When ON, any message deleted in this chat will be auto-resent by the bot!${FOOTER}`);
        }

        // ==========================================
        // 💾 UPDATE
        // ==========================================
        try {
            await handleSettingUpdate(`NODELETE_${chatJid}`, val, reply, number);

            if (val === 'on') {
                await reply(`✅ *NODELETE ENABLED*

🗑️ Deleted messages will be auto-resent in this ${sender.endsWith('@g.us') ? 'group' : 'chat'}!

💡 *How it works:*
1. Someone sends a message
2. They delete it
3. Bot auto-resends it with sender info

⚠️ *Note:* Bot must have permission to read messages!${FOOTER}`);
            } else {
                await reply(`❌ *NODELETE DISABLED*

Auto-resend of deleted messages turned OFF.${FOOTER}`);
            }
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
