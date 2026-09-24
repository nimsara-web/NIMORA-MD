/**
 * NIMORA MD - Get Profile Picture
 * Category: owner
 * 
 * Get user profile picture.
 * BOT OWNER + MAIN OWNER can use.
 */

module.exports = {
    name: 'getpp',
    aliases: ['pp', 'profilepic'],
    category: 'owner',
    description: 'Get user profile picture (owner only)',

    async execute(ctx) {
        const {
            args, reply, socket, msg, sender, isOwner, isMainOwner,
            channelContext, FOOTER
        } = ctx;

        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*${FOOTER}`);
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        let targetJid;

        if (quoted?.participant) {
            targetJid = quoted.participant;
        } else if (args[0]) {
            const num = args[0].replace(/[^0-9]/g, '');
            if (!num || num.length < 9) {
                return reply(`⚠️ *Invalid number!*${FOOTER}`);
            }
            targetJid = `${num}@s.whatsapp.net`;
        } else {
            return reply(`⚠️ *Reply to a user or provide a number!*

*Usage:*
• \`.getpp\` (reply to user)
• \`.getpp 94784280074\`${FOOTER}`);
        }

        try {
            const url = await socket.profilePictureUrl(targetJid, 'image');

            if (!url) {
                return reply(`❌ *No profile picture found!*${FOOTER}`);
            }

            await socket.sendMessage(sender, {
                image: { url },
                caption: `🖼️ *PROFILE PICTURE*

👤 *Number:* +${targetJid.split('@')[0]}
🕐 *Time:* ${new Date().toLocaleString()}${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

            console.log(`[GETPP] Fetched for ${targetJid}`);
        } catch (e) {
            console.error('[GETPP] Error:', e.message);
            await reply(`❌ *Profile pic not available!*

📝 *Reason:* User may have privacy settings${FOOTER}`);
        }
    }
};
