/**
 * NIMORA MD - Status Saver
 * Category: owner
 * 
 * Save WhatsApp Status media (24h stories) to bot self-chat.
 * - Manual: reply to a status with .statussave
 * - Auto: .statusauto on → auto-save all statuses
 * - Emoji: .statussave emoji 👀
 */

const pino = require('pino');
const { downloadMediaMessage } = require('baileys');

module.exports = {
    name: 'statussave',
    aliases: ['svstatus', 'savestatus', 'ssv'],
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
💾 Every status you view will be auto-saved to bot's self-chat.

⚠️ *Note:* Bot must be online when status is viewed!
💡 *Tip:* Bot automatically views statuses (if .autoview on)

*Commands:*
• \`.statusauto on\` - Enable auto-save
• \`.statusauto off\` - Disable
• \`.statussave emoji [emoji]\` - Change react emoji${FOOTER}`);
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
                return reply(`🎯 *Current emoji:* ${currentEmoji}\n\n*Usage:* \`.statussave emoji [emoji]\`${FOOTER}`);
            }
            await input('STATUS_EMOJI', newEmoji, number);
            await reply(`✅ *Emoji updated:* ${newEmoji}${FOOTER}`);
            return;
        }

        // ==========================================
        // 📊 STATUS
        // ==========================================
        if (!action || action === 'status') {
            const autoEnabled = await get('STATUS_AUTO', number) || 'off';
            const emoji = await get('STATUS_EMOJI', number) || '👀';

            return reply(`📊 *STATUS SAVE SETTINGS*

📥 *Auto-Save:* ${autoEnabled === 'on' ? '✅ ON' : '❌ OFF'}
🎯 *Emoji:* ${emoji}

*Commands:*
• \`.statusauto on [emoji]\` - Enable auto-save
• \`.statusauto off\` - Disable
• \`.statussave emoji [emoji]\` - Change emoji

💡 *How to use:*
• *Auto:* Enable \`.statusauto on\` → auto-save every viewed status
• *Manual:* Reply to a status with \`.statussave\`

⚠️ *Important:*
• Bot must be online when status is viewed
• Bot must have viewed the status (bot status view must work)
• Bot self-chat receives all saved media${FOOTER}`);
        }

        // ==========================================
        // 📥 MANUAL SAVE (reply to status)
        // ==========================================
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.quotedMessage) {
            return reply(`⚠️ *Reply to a Status media with \`.statussave\`*

💡 Or enable auto-save: \`.statusauto on\`${FOOTER}`);
        }

        // Check if quoted is a status
        // Statuses have remoteJid = "status@broadcast"
        const isStatus = quoted.remoteJid === 'status@broadcast' ||
                         sender === 'status@broadcast';

        let qMsg = unwrapMessage(quoted.quotedMessage);
        if (!qMsg) return reply(`⚠️ *Could not read quoted message!*${FOOTER}`);

        const mediaInfo = getMediaType(qMsg);
        if (!mediaInfo) return reply(`⚠️ *Reply to a status image/video!*${FOOTER}`);

        const { type: messageType, data: mediaData } = mediaInfo;
        if (!['imageMessage', 'videoMessage'].includes(messageType)) {
            return reply(`⚠️ *Only image/video statuses supported!*${FOOTER}`);
        }

        // React
        const emoji = await get('STATUS_EMOJI', number) || '👀';
        try {
            await socket.sendMessage(sender, {
                react: { text: emoji, key: msg.key }
            });
        } catch (e) {}

        // Download
        try {
            const buffer = await downloadMediaMessage(
                {
                    key: {
                        remoteJid: quoted.remoteJid || 'status@broadcast',
                        id: quoted.stanzaId,
                        participant: quoted.participant
                    },
                    message: { [messageType]: mediaData }
                },
                'buffer',
                {},
                { logger: pino({ level: 'silent' }) }
            );

            if (!buffer || buffer.length === 0) {
                return reply(`❌ *Download failed!*${FOOTER}`);
            }

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

            console.log(`[STATUSSAVE] ✅ Saved from ${senderName} to self-chat`);

        } catch (err) {
            console.error('[STATUSSAVE]', err.message);
            await reply(`❌ *Failed:* ${err.message}${FOOTER}`);
        }
    }
};
