/**
 * NIMORA MD - Save Media
 * Category: main
 * 
 * Save replied media (image/video/audio/document) to bot self-chat.
 * Usage: Reply to media with .savemedia
 */

const pino = require('pino');
const { downloadMediaMessage } = require('baileys');

module.exports = {
    name: 'savemedia',
    aliases: ['savemsg', 'svm'],   // ← 'save' අයින් කරලා, වෙනත් aliases
    category: 'main',
    description: 'Save replied media to self-chat',

    async execute(ctx) {
        const {
            socket, msg, reply, sender, number,
            unwrapMessage, getMediaType, FOOTER
        } = ctx;

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.quotedMessage) {
            return reply(`⚠️ *Reply to media with \`.savemedia\`*

💡 For status → use \`.save\` instead${FOOTER}`);
        }

        let qMsg = unwrapMessage(quoted.quotedMessage);
        if (!qMsg) return reply(`⚠️ *Could not read quoted message!*${FOOTER}`);

        const mediaInfo = getMediaType(qMsg);
        if (!mediaInfo) return reply(`⚠️ *Reply to media (image/video/audio/doc)*${FOOTER}`);

        const { type: messageType, data: mediaData } = mediaInfo;

        try {
            const buffer = await downloadMediaMessage(
                {
                    key: {
                        remoteJid: quoted.remoteJid || sender,
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
            const senderName = (quoted.participant || sender).split('@')[0];
            const caption = `💾 *SAVED MEDIA*

👤 *From:* @${senderName}
📁 *Type:* ${messageType.replace('Message', '')}
🕐 *Time:* ${new Date().toLocaleString()}
${mediaData?.caption ? `💬 *Caption:* ${mediaData.caption}\n` : ''}
> _Saved by NIM OFFICIAL_${FOOTER}`;

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
            } else if (messageType === 'audioMessage') {
                await socket.sendMessage(selfJid, {
                    audio: buffer,
                    mimetype: mediaData?.mimetype || 'audio/mpeg',
                    ptt: mediaData?.ptt || false,
                    contextInfo: ctx.channelContext
                });
            } else if (messageType === 'documentMessage') {
                await socket.sendMessage(selfJid, {
                    document: buffer,
                    mimetype: mediaData?.mimetype || 'application/octet-stream',
                    fileName: mediaData?.fileName || 'document',
                    caption,
                    contextInfo: ctx.channelContext
                });
            } else {
                return reply(`⚠️ *Unsupported media type!*${FOOTER}`);
            }

            // Silent success — no reply
            console.log(`[SAVEMEDIA] ✅ Saved ${messageType} to self-chat`);

        } catch (err) {
            console.error('[SAVEMEDIA]', err.message);
            await reply(`❌ *Failed:* ${err.message}${FOOTER}`);
        }
    }
};
