/**
 * NIMORA MD - Silent ViewOnce Save
 * Category: owner
 * 
 * Saves view-once media to bot's own self-chat WITHOUT notifying the sender.
 * Owner-only feature with on/off toggle and custom reaction.
 */

const pino = require('pino');
const { downloadMediaMessage } = require('baileys');
const config = require('../../config');

module.exports = {
    name: 'vvsave',
    aliases: ['savevv', 'silentvv', 'ghostvv', 'svv'],
    category: 'owner',
    description: 'Silently save view-once media to bot self-chat',

    async execute(ctx) {
        const {
            socket, msg, reply, sender, number, isOwner,
            get, input, handleSettingUpdate,
            unwrapMessage, getMediaType, FOOTER
        } = ctx;

        // ==========================================
        // 👑 OWNER CHECK
        // ==========================================
        if (!isOwner) {
            return reply(`⚠️ *Only Bot Owner!*${FOOTER}`);
        }

        const args = ctx.args || [];
        const action = args[0]?.toLowerCase();

        // ==========================================
        // ⚙️ TOGGLE: on / off
        // ==========================================
        if (action === 'on' || action === 'off') {
            await handleSettingUpdate('VVSAVE_ENABLED', action, reply, number);

            if (action === 'on') {
                const emoji = args[1] || '👀';
                await input('VVSAVE_EMOJI', emoji, number);
                await reply(`✅ *VVSave ENABLED*

🎯 Emoji: ${emoji}
💾 Media will be saved silently to bot's self-chat.
👤 Sender will NOT be notified.

💡 Reply to view-once media with \`.vvsave\` to save it.${FOOTER}`);
            } else {
                await reply(`❌ *VVSave DISABLED*${FOOTER}`);
            }
            return;
        }

        // ==========================================
        // 🎯 EMOJI CHANGE
        // ==========================================
        if (action === 'emoji') {
            const newEmoji = args[1];
            if (!newEmoji) {
                const currentEmoji = await get('VVSAVE_EMOJI', number) || '👀';
                return reply(`🎯 *Current emoji:* ${currentEmoji}\n\n*Usage:* \`.vvsave emoji [emoji]\`${FOOTER}`);
            }
            await input('VVSAVE_EMOJI', newEmoji, number);
            await reply(`✅ *Emoji updated:* ${newEmoji}${FOOTER}`);
            return;
        }

        // ==========================================
        // 📊 STATUS (also default when no args)
        // ==========================================
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        const hasQuotedMedia = quoted?.quotedMessage &&
            (quoted.quotedMessage.imageMessage || quoted.quotedMessage.videoMessage ||
             quoted.quotedMessage.viewOnceMessage || quoted.quotedMessage.viewOnceMessageV2);

        if (action === 'status' || (!action && !hasQuotedMedia)) {
            const enabled = await get('VVSAVE_ENABLED', number) || 'off';
            const emoji = await get('VVSAVE_EMOJI', number) || '👀';

            return reply(`📊 *VVSAVE STATUS*

🔘 *Status:* ${enabled === 'on' ? '✅ ON' : '❌ OFF'}
🎯 *Emoji:* ${emoji}

*Commands:*
• \`.vvsave on [emoji]\` - Enable
• \`.vvsave off\` - Disable
• \`.vvsave status\` - Check status
• \`.vvsave emoji [emoji]\` - Change emoji

💡 *How to use:* Reply to a view-once media with \`.vvsave\`${FOOTER}`);
        }

        // ==========================================
        // ⚙️ CHECK ENABLED
        // ==========================================
        const enabled = await get('VVSAVE_ENABLED', number) || 'off';
        if (enabled !== 'on' && action !== 'force') {
            return reply(`❌ *VVSave is disabled.*\n\n💡 Enable with: \`.vvsave on\`${FOOTER}`);
        }

        // ==========================================
        // 📥 GET QUOTED MEDIA
        // ==========================================
        if (!quoted || !quoted.quotedMessage) {
            return reply(`⚠️ *Reply to a View Once media with \`.vvsave\`*${FOOTER}`);
        }

        let qMsg = unwrapMessage(quoted.quotedMessage);
        if (!qMsg) {
            return reply(`⚠️ *Could not read quoted message!*${FOOTER}`);
        }

        const mediaInfo = getMediaType(qMsg);
        if (!mediaInfo) {
            return reply(`⚠️ *Reply to an image or video!*${FOOTER}`);
        }

        const { type: messageType, data: mediaData } = mediaInfo;
        if (!['imageMessage', 'videoMessage'].includes(messageType)) {
            return reply(`⚠️ *Only image/video supported!*${FOOTER}`);
        }

        // ==========================================
        // 🔕 REACT (with custom emoji) - NO REPLY
        // ==========================================
        const emoji = await get('VVSAVE_EMOJI', number) || '👀';
        try {
            await socket.sendMessage(sender, {
                react: { text: emoji, key: msg.key }
            });
        } catch (e) {
            console.log('[VVSAVE] React failed:', e.message);
        }

        // ==========================================
        // 📥 DOWNLOAD MEDIA
        // ==========================================
        try {
            const downloadTarget = {
                key: {
                    remoteJid: quoted.remoteJid || sender,
                    id: quoted.stanzaId,
                    participant: quoted.participant
                },
                message: { [messageType]: mediaData }
            };

            console.log(`[VVSAVE] Downloading ${messageType} silently...`);

            const buffer = await downloadMediaMessage(
                downloadTarget,
                'buffer',
                {},
                { logger: pino({ level: 'silent' }) }
            );

            if (!buffer || buffer.length === 0) {
                console.log('[VVSAVE] ❌ Download failed (empty buffer)');
                return;
            }

            console.log(`[VVSAVE] ✅ Downloaded ${buffer.length} bytes`);

            // ==========================================
            // 🎯 SEND TO BOT'S OWN SELF-CHAT (SILENT!)
            // ==========================================
            const selfJid = `${number}@s.whatsapp.net`;

            const senderName = (quoted.participant || sender).split('@')[0];
            const chatType = sender.endsWith('@g.us') ? 'Group' : 'Inbox';
            const timestamp = new Date().toLocaleString();

            const caption = `🔒 *SILENTLY SAVED*

👤 *From:* @${senderName}
📍 *Chat:* ${chatType}
🕐 *Time:* ${timestamp}
${mediaData?.caption ? `💬 *Caption:* ${mediaData.caption}\n` : ''}
> _Saved by VVSave - Owner only_${FOOTER}`;

            if (messageType === 'imageMessage') {
                await socket.sendMessage(selfJid, {
                    image: buffer,
                    caption,
                    mentions: [quoted.participant || sender]
                });
            } else if (messageType === 'videoMessage') {
                await socket.sendMessage(selfJid, {
                    video: buffer,
                    caption,
                    mentions: [quoted.participant || sender]
                });
            }

            console.log(`[VVSAVE] ✅ Saved to self-chat: ${selfJid}`);

        } catch (err) {
            console.error('[VVSAVE] Error:', err.message);
        }
    }
};
