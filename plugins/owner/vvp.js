/**
 * NIMORA MD - View Once to Owner (Self-Chat)
 * Category: main
 */

const pino = require('pino');
const { downloadMediaMessage } = require('baileys');

module.exports = {
    name: 'vvp',
    aliases: ['vvowner', 'sendowner'],
    category: 'main',
    description: 'Send view-once media to bot self-chat',

    async execute(ctx) {
        const {
            socket, msg, reply, sender, number, senderNumber,
            unwrapMessage, getMediaType, get, input,
            channelContext, FOOTER
        } = ctx;

        // ==========================================
        // 1. Get quoted message
        // ==========================================
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted || !quoted.quotedMessage) {
            return reply(`⚠️ *Reply to a View Once media with .vvp*${FOOTER}`);
        }

        // ==========================================
        // 2. Unwrap
        // ==========================================
        let qMsg = unwrapMessage(quoted.quotedMessage);
        if (!qMsg) {
            return reply(`⚠️ *Could not read quoted message!*${FOOTER}`);
        }

        // ==========================================
        // 3. Detect media
        // ==========================================
        const mediaInfo = getMediaType(qMsg);
        if (!mediaInfo) {
            return reply(`⚠️ *Reply to an image or video!*${FOOTER}`);
        }

        const { type: messageType, data: mediaData } = mediaInfo;

        if (!['imageMessage', 'videoMessage'].includes(messageType)) {
            return reply(`⚠️ *Only image/video supported!*${FOOTER}`);
        }

        // ==========================================
        // 4. Download
        // ==========================================
        try {
            await reply(`⏳ *Sending to your self-chat privately...*${FOOTER}`);

            const downloadTarget = {
                key: {
                    remoteJid: quoted.remoteJid || sender,
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
                return reply(`❌ *Download failed!*${FOOTER}`);
            }

            // ==========================================
            // 5. 🔑 KEY FIX: Send to BOT'S OWN number
            // ==========================================
            // selfJid = bot's own number (the bot that received the message)
            const selfJid = `${number}@s.whatsapp.net`;

            const caption = `📥 *VIEW ONCE RECEIVED*

👤 *From:* @${senderNumber}
📍 *Chat:* ${sender.includes('@g.us') ? 'Group' : 'Inbox'}
🕐 *Time:* ${new Date().toLocaleString()}
💬 *Caption:* ${mediaData?.caption || 'None'}${FOOTER}`;

            if (messageType === 'imageMessage') {
                await socket.sendMessage(selfJid, {
                    image: buffer,
                    caption,
                    mentions: [quoted.participant || sender],
                    contextInfo: channelContext
                });
            } else {
                await socket.sendMessage(selfJid, {
                    video: buffer,
                    caption,
                    mentions: [quoted.participant || sender],
                    contextInfo: channelContext
                });
            }

            console.log(`[VVP] ✅ Sent to self-chat: ${selfJid}`);

            await reply(`✅ *Sent to your self-chat (+${number}) privately!*${FOOTER}`);

        } catch (err) {
            console.error('[VVP] Error:', err);
            await reply(`❌ *Failed:* ${err.message}${FOOTER}`);
        }
    }
};
