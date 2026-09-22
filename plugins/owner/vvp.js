/**
 * NIMORA MD - View Once to Owner
 * Category: main
 */

const pino = require('pino');
const { downloadMediaMessage } = require('baileys');
const config = require('../../config');

module.exports = {
    name: 'vvp',
    aliases: ['vvowner', 'sendowner'],
    category: 'main',
    description: 'Send view-once media to owner',

    async execute(ctx) {
        const { socket, msg, reply, sender, number, senderNumber, unwrapMessage, getMediaType, channelContext, FOOTER } = ctx;

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
            await reply(`⏳ *Sending to owner privately...*${FOOTER}`);

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
            // 5. Send to owner
            // ==========================================
            const ownerNumber = await ctx.get('OWNER_NUMBER', number) || config.ownerNumber;
            const ownerJid = `${ownerNumber}@s.whatsapp.net`;

            const caption = `📥 *VIEW ONCE RECEIVED*

👤 *From:* @${senderNumber}
📍 *Chat:* ${sender.includes('@g.us') ? 'Group' : 'Inbox'}
🕐 *Time:* ${new Date().toLocaleString()}
💬 *Caption:* ${mediaData?.caption || 'None'}${FOOTER}`;

            if (messageType === 'imageMessage') {
                await socket.sendMessage(ownerJid, {
                    image: buffer,
                    caption,
                    mentions: [quoted.participant || sender],
                    contextInfo: channelContext
                });
            } else {
                await socket.sendMessage(ownerJid, {
                    video: buffer,
                    caption,
                    mentions: [quoted.participant || sender],
                    contextInfo: channelContext
                });
            }

            await reply(`✅ *Sent to owner (+${ownerNumber}) privately!*${FOOTER}`);

        } catch (err) {
            console.error('[VVP] Error:', err);
            await reply(`❌ *Failed:* ${err.message}${FOOTER}`);
        }
    }
};
