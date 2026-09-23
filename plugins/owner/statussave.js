/**
 * NIMORA MD - Status Saver
 * Category: owner
 * 
 * Save WhatsApp Status media (24h stories) to bot self-chat.
 * 
 * Usage:
 *   Reply to a status with .save OR .statussave
 *   .statusauto on       → Auto-save every viewed status
 *   .save emoji 👀       → Change react emoji
 */

const pino = require('pino');
const { downloadMediaMessage } = require('baileys');

module.exports = {
    name: 'statussave',
    aliases: ['svstatus', 'savestatus', 'ssv', 'save', 'sv'],
    category: 'owner',
    description: 'Save WhatsApp status media',

    async execute(ctx) {
        const {
            socket, msg, reply, sender, number,
            isOwner, isMainOwner,
            get, input, handleSettingUpdate,
            unwrapMessage, getMediaType, FOOTER
        } = ctx;

        // ==========================================
        // 👑 OWNER CHECK
        // ==========================================
        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Only Bot Owner!*${FOOTER}`);
        }

        const args = ctx.args || [];
        const action = args[0]?.toLowerCase();

        // ==========================================
        // ⚙️ TOGGLE: on / off
        // ==========================================
        if (action === 'on' || action === 'off') {
            await handleSettingUpdate('STATUS_AUTO', action, reply, number);

            if (action === 'on') {
                const emoji = args[1] || '👀';
                await input('STATUS_EMOJI', emoji, number);
                await reply(`✅ *Status Auto-Save ENABLED*

🎯 Emoji: ${emoji}
💾 Every status will be auto-saved to bot's self-chat.

⚠️ Bot must be online when status is posted!${FOOTER}`);
            } else {
                await reply(`❌ *Status Auto-Save DISABLED*${FOOTER}`);
            }
            return;
        }

        // ==========================================
        // 🎯 EMOJI CHANGE
        // ==========================================
        if (action === 'emoji') {
            const newEmoji = args[1];
            if (!newEmoji) {
                const currentEmoji = await get('STATUS_EMOJI', number) || '👀';
                return reply(`🎯 *Current emoji:* ${currentEmoji}\n\n*Usage:* \`.save emoji [emoji]\`${FOOTER}`);
            }
            await input('STATUS_EMOJI', newEmoji, number);
            await reply(`✅ *Emoji updated:* ${newEmoji}${FOOTER}`);
            return;
        }

        // ==========================================
        // 📊 STATUS (no quoted media)
        // ==========================================
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        const hasQuoted = quoted?.quotedMessage;

        // Check if quoted is from a status
        const isStatusMessage = quoted && (
            quoted.remoteJid === 'status@broadcast' ||
            (quoted.participant && !quoted.remoteJid) ||
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessage ||
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2 ||
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2Extension
        );

        if ((!action || action === 'status') && !hasQuoted) {
            const autoEnabled = await get('STATUS_AUTO', number) || 'off';
            const emoji = await get('STATUS_EMOJI', number) || '👀';

            return reply(`📊 *STATUS SAVE SETTINGS*

📥 *Auto-Save:* ${autoEnabled === 'on' ? '✅ ON' : '❌ OFF'}
🎯 *Emoji:* ${emoji}

*Commands:*
• \`.save\` (reply to status) → Save manually
• \`.save on [emoji]\` → Enable auto-save
• \`.save off\` → Disable auto-save
• \`.save emoji [emoji]\` → Change emoji

💡 *How to use:*
1. View someone's status
2. Reply to that status
3. Send \`.save\`
4. Status media → saved to bot's self-chat ✅

⚠️ *Important:*
• Bot must view the status first
• Status must be visible to bot
• Works with images & videos${FOOTER}`);
        }

        // ==========================================
        // 📥 SAVE STATUS (reply to status)
        // ==========================================
        if (!hasQuoted) {
            return reply(`⚠️ *Reply to a Status media with \`.save\`*${FOOTER}`);
        }

        let qMsg = unwrapMessage(quoted.quotedMessage);
        if (!qMsg) {
            return reply(`⚠️ *Could not read quoted message!*${FOOTER}`);
        }

        const mediaInfo = getMediaType(qMsg);
        if (!mediaInfo) {
            return reply(`⚠️ *Reply to a status image/video!*${FOOTER}`);
        }

        const { type: messageType, data: mediaData } = mediaInfo;
        if (!['imageMessage', 'videoMessage'].includes(messageType)) {
            return reply(`⚠️ *Only image/video statuses supported!*${FOOTER}`);
        }

        // ==========================================
        // 🔕 SILENT REACT
        // ==========================================
        const emoji = await get('STATUS_EMOJI', number) || '👀';
        try {
            await socket.sendMessage(sender, {
                react: { text: emoji, key: msg.key }
            });
        } catch (e) {}

        // ==========================================
        // 📥 DOWNLOAD & SAVE
        // ==========================================
        try {
            console.log(`[STATUSSAVE] 📥 Downloading ${messageType}...`);

            // Build download target
            // For status messages, remoteJid is 'status@broadcast'
            const downloadTarget = {
                key: {
                    remoteJid: quoted.remoteJid || 'status@broadcast',
                    id: quoted.stanzaId,
                    participant: quoted.participant
                },
                message: { [messageType]: mediaData }
            };

            const buffer = await downloadMediaMessage(
                downloadTarget,
                'buffer',
                {},
                { logger: pino({ level: 'silent' }) }
            );

            if (!buffer || buffer.length === 0) {
                console.log(`[STATUSSAVE] ❌ Empty buffer`);
                return reply(`❌ *Download failed! (empty media)*${FOOTER}`);
            }

            console.log(`[STATUSSAVE] ✅ Downloaded ${buffer.length} bytes`);

            // ==========================================
            // 🎯 SEND TO BOT SELF-CHAT
            // ==========================================
            const selfJid = `${number}@s.whatsapp.net`;
            const senderName = (quoted.participant || 'unknown').split('@')[0];

            const caption = `📸 *STATUS SAVED*

👤 *From:* @${senderName}
🕐 *Time:* ${new Date().toLocaleString()}
${mediaData?.caption ? `💬 *Caption:* ${mediaData.caption}\n` : ''}
> _Saved by StatusSave_${FOOTER}`;

            if (messageType === 'imageMessage') {
                await socket.sendMessage(selfJid, {
                    image: buffer,
                    caption,
                    mentions: [quoted.participant || 'unknown@s.whatsapp.net']
                });
            } else if (messageType === 'videoMessage') {
                await socket.sendMessage(selfJid, {
                    video: buffer,
                    caption,
                    mentions: [quoted.participant || 'unknown@s.whatsapp.net']
                });
            }

            console.log(`[STATUSSAVE] ✅ Saved to self-chat: ${selfJid}`);

            // Send confirmation (silently via reaction only)
            // Don't send a text reply to avoid noise

        } catch (err) {
            console.error('[STATUSSAVE] ❌', err.message);
            await reply(`❌ *Failed:* ${err.message}${FOOTER}`);
        }
    }
};
