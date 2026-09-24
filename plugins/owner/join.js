/**
 * NIMORA MD - Join Group
 * Category: owner
 * 
 * Join a group via invite link.
 * BOT OWNER + MAIN OWNER can use.
 */

module.exports = {
    name: 'join',
    aliases: ['joingroup'],
    category: 'owner',
    description: 'Join a group via invite link (owner only)',

    async execute(ctx) {
        const { args, reply, isOwner, isMainOwner, socket, FOOTER } = ctx;

        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*${FOOTER}`);
        }

        const link = args[0];
        if (!link || !link.includes('chat.whatsapp.com')) {
            return reply(`⚠️ *Usage:* \`.join [group invite link]\`

*Example:*
\`.join https://chat.whatsapp.com/XXXXXXX\`${FOOTER}`);
        }

        try {
            // Extract code from URL
            const code = link.split('/').pop().split('?')[0];

            if (!code) {
                return reply(`❌ *Invalid invite link!*${FOOTER}`);
            }

            await socket.groupAcceptInvite(code);
            await reply(`✅ *Joined group successfully!*${FOOTER}`);

            console.log(`[JOIN] Joined group with code: ${code}`);
        } catch (e) {
            console.error('[JOIN] Error:', e.message);

            let errMsg = e.message;
            if (errMsg.includes('not-authorized') || errMsg.includes('forbidden')) {
                errMsg = 'Link expired or bot is banned from the group';
            } else if (errMsg.includes('gone') || errMsg.includes('404')) {
                errMsg = 'Invite link is invalid or expired';
            }

            await reply(`❌ *Failed to join!*

📝 ${errMsg}${FOOTER}`);
        }
    }
};
