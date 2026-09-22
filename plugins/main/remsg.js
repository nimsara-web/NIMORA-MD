/**
 * NIMORA MD - Recover Deleted Message
 * Category: main
 * 
 * Recover the last deleted message in this chat.
 */

module.exports = {
    name: 'remsg',
    aliases: ['getdel', 'recover', 'delrecover', 'getdeleted'],
    category: 'main',
    description: 'Recover last deleted message',

    async execute(ctx) {
        const { reply, sender, deletedMessages, FOOTER } = ctx;

        // ==========================================
        // 🔍 FIND LAST DELETED IN THIS CHAT
        // ==========================================
        let lastDeleted = deletedMessages.get(sender);

        // Fallback: partial match
        if (!lastDeleted) {
            for (const [chatId, deleted] of deletedMessages) {
                if (chatId === sender ||
                    chatId.includes(sender.split('@')[0]) ||
                    sender.includes(chatId.split('@')[0])) {
                    lastDeleted = deleted;
                    break;
                }
            }
        }

        if (!lastDeleted) {
            return reply(`❌ *No recent deleted message found!*

💡 *Tips:*
• Delete a message to test
• Then use \`.remsg\`
• Only last deleted msg per chat is stored
• Bot must be online when deletion happens${FOOTER}`);
        }

        // ==========================================
        // 📝 FORMAT & SEND
        // ==========================================
        const senderName = lastDeleted.senderName || lastDeleted.sender?.split('@')[0] || 'Unknown';
        const minsAgo = Math.floor((Date.now() - lastDeleted.timestamp) / 60000);
        const timeAgo = minsAgo < 1 ? 'Just now' : `${minsAgo}m ago`;

        const recoverText = `╭─⏖ *🗑️ DELETED MESSAGE RECOVERED* ⏖─╮
│
│ 👤 *Sender:* @${senderName}
│ ⏰ *Time:* ${lastDeleted.time}
│ ⌛ *Deleted:* ${timeAgo}
│
│ 💬 *Message:*
│ ${lastDeleted.text}
│
╰──────────────────────⏖${FOOTER}`;

        try {
            await reply({
                text: recoverText,
                mentions: [lastDeleted.sender]
            });
        } catch (e) {
            await reply(`❌ Failed to recover: ${e.message}${FOOTER}`);
        }
    }
};
