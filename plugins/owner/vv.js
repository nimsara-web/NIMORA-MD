/**
 * NIMORA MD - View Once Command
 * Category: main
 */

const pino = require('pino');
const { downloadMediaMessage } = require('baileys');

module.exports = {
    name: 'vv',
    aliases: ['viewonce', 'retrieve'],
    category: 'main',
    description: 'Retrieve view-once media',

    async execute(ctx) {
        const { socket, msg, reply, sender, unwrapMessage, getMediaType, channelContext, FOOTER } = ctx;

        // ==========================================
        // 1. Get quoted message
        // ==========================================
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted || !quoted.quotedMessage) {
            return reply(`⚠️ *Reply to a View Once media with .vv*${FOOTER}`);
        }

        // ==========================================
        // 2. Unwrap the quoted message
        // ==========================================
        let qMsg = unwrapMessage(quoted.quotedMessage);
        if (!qMsg) {
            return reply(`⚠️ *Could not read quoted message!*${FOOTER}`);
        }

        // ==========================================
        // 3. Detect media type
        // ==========================================
        const mediaInfo = getMediaType(qMsg);
        if (!mediaInfo) {
            return reply(`⚠️ *Reply to an image or video!*${FOOTER}`);
        }

        const { type: messageType, data: mediaData } = mediaInfo;

        if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(messageType)) {
            return reply(`⚠️ *Only image/video/audio supported!*${FOOTER}`);
        }

        // ==========================================
        // 4. Build download target
        // ==========================================
        const downloadTarget = {
            key: {
                remoteJid: quoted.remoteJid || sender,
                id: quoted.stanzaId,
                participant: quoted.participant
            },
            message: {
                [messageType]: mediaData
            }
        };

        // ==========================================
        // 5. Download the media
        // ==========================================
        try {
            console.log(`[VV] Downloading ${messageType} for ${sender}`);

            const buffer = await downloadMediaMessage(
                downloadTarget,
                'buffer',
                {},
                { logger: pino({ level: 'silent' }) }
            );

            if (!buffer || buffer.length === 0) {
                return reply(`❌ *Failed to download media!*${FOOTER}`);
            }

            console.log(`[VV] ✅ Downloaded ${buffer.length} bytes`);

            const caption = `📥 *View Once Media*

${mediaData?.caption ? `💬 ${mediaData.caption}` : ''}${FOOTER}`;

            // ==========================================
            // 6. Re-send as normal media
            // ==========================================
            if (messageType === 'imageMessage') {
                await socket.sendMessage(sender, {
                    image: buffer,
                    caption,
                    contextInfo: channelContext
                }, { quoted: msg });
            } else if (messageType === 'videoMessage') {
                await socket.sendMessage(sender, {
                    video: buffer,
                    caption,
                    contextInfo: channelContext
                }, { quoted: msg });
            } else if (messageType === 'audioMessage') {
                await socket.sendMessage(sender, {
                    audio: buffer,
                    mimetype: mediaData?.mimetype || 'audio/mpeg',
                    ptt: false,
                    contextInfo: channelContext
                }, { quoted: msg });
            }

        } catch (err) {
            console.error('[VV] Error:', err);
            await reply(`❌ *Failed to retrieve media!*

📝 *Reason:* ${err.message}

💡 *Tips:*
• Media may have expired
• Try again quickly after receiving
• Older than 7 days → can't retrieve${FOOTER}`);
        }
    }
};
