/**
 * NIMORA MD - Forward Command
 * Category: owner
 * 
 * Forward a replied message to any chat/status/channel.
 * Supports LARGE files (movies, documents) and audio status.
 * 
 * Usage:
 *   Reply + .forward [target] [options]
 * 
 * Examples:
 *   .forward 94784280074              → Forward to number
 *   .forward 120363362308230584@newsletter  → Forward to channel
 *   .forward 123456789-123456@g.us   → Forward to group
 *   .forward mystatus                 → Forward to MY status
 *   .forward mystatus audio           → Forward audio to status
 * 
 * OWNER ONLY
 */

const pino = require('pino');
const { downloadMediaMessage } = require('baileys');
const config = require('../../config');

module.exports = {
    name: 'forward',
    aliases: ['fwd', 'share'],
    category: 'owner',
    description: 'Forward replied message to any chat/status (owner only)',

    async execute(ctx) {
        const {
            socket, msg, reply, sender, senderNumber, number,
            isOwner, isMainOwner, args,
            unwrapMessage, getMediaType,
            channelContext, FOOTER
        } = ctx;

        // ==========================================
        // 🔒 OWNER CHECK
        // ==========================================
        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*${FOOTER}`);
        }

        // ==========================================
        // 📌 PARSE TARGET
        // ==========================================
        const target = args[0]?.toLowerCase();

        if (!target) {
            return reply(`📤 *FORWARD COMMAND*

*Usage:* Reply to a message + \`.forward [target]\`

*Examples:*
• \`.forward 94784280074\` — Forward to number
• \`.forward mystatus\` — Forward to MY status
• \`.forward mystatus audio\` — Forward audio to status
• \`.forward 120363362308230584@newsletter\` — Forward to channel
• \`.forward 123456789-123456@g.us\` — Forward to group

📁 *Supports:* Text, Image, Video, Audio, Document, Sticker
📦 *Size:* Up to 2GB (large files OK!)

⚠️ *Reply to any message* with this command!${FOOTER}`);
        }

        // ==========================================
        // 📥 GET QUOTED MESSAGE
        // ==========================================
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted || !quoted.quotedMessage) {
            return reply(`⚠️ *Please reply to a message to forward!*${FOOTER}`);
        }

        // ==========================================
        // 🎯 NORMALIZE TARGET
        // ==========================================
        let targetJid = target;

        const isStatusTarget = ['mystatus', 'status', 'story'].includes(target);
        const forceAudioStatus = args[1]?.toLowerCase() === 'audio';

        // Handle number → JID
        if (!isStatusTarget) {
            if (/^[0-9]+$/.test(targetJid)) {
                targetJid = `${targetJid}@s.whatsapp.net`;
            }
            // Group/channel without suffix
            else if (/^[0-9-]+$/.test(targetJid)) {
                targetJid = `${targetJid}@g.us`;
            }
        }

        // ==========================================
        // 📝 EXTRACT QUOTED CONTENT
        // ==========================================
        const qMsg = unwrapMessage(quoted.quotedMessage);
        if (!qMsg) {
            return reply(`❌ *Could not read quoted message!*${FOOTER}`);
        }

        const mediaInfo = getMediaType(qMsg);
        const textContent = qMsg.conversation ||
                           qMsg.extendedTextMessage?.text ||
                           qMsg.imageMessage?.caption ||
                           qMsg.videoMessage?.caption ||
                           qMsg.documentMessage?.caption ||
                           '';

        // ==========================================
        // 📊 TARGET INFO MESSAGE
        // ==========================================
        const targetDesc = isStatusTarget
            ? `📸 MY STATUS${forceAudioStatus ? ' (Audio)' : ''}`
            : `📱 ${targetJid}`;

        const mediaSize = mediaInfo?.data?.fileLength
            ? formatBytes(mediaInfo.data.fileLength)
            : 'unknown';

        await reply(`📤 *Forwarding...*

🎯 *To:* ${targetDesc}
🔄 *Type:* ${mediaInfo ? mediaInfo.type.replace('Message', '') : 'Text'}
📦 *Size:* ${mediaSize}${FOOTER}`);

        try {
            // ==========================================
            // 📸 STATUS TARGET (image/video/audio)
            // ==========================================
            if (isStatusTarget) {
                if (!mediaInfo) {
                    return reply(`❌ *Status needs media!*

💡 Reply to image/video/audio.${FOOTER}`);
                }

                const { type, data } = mediaInfo;
                const supportedStatusTypes = ['imageMessage', 'videoMessage', 'audioMessage'];

                if (!supportedStatusTypes.includes(type)) {
                    return reply(`❌ *Status only supports:*
• Image
• Video
• Audio

📁 Your type: ${type.replace('Message', '')}${FOOTER}`);
                }

                // ==========================================
                // 🎵 AUDIO STATUS
                // ==========================================
                if (type === 'audioMessage' || forceAudioStatus) {
                    console.log(`[FORWARD] 🎵 Downloading audio for status...`);

                    const buffer = await downloadMediaMessage(
                        {
                            key: {
                                remoteJid: quoted.remoteJid || sender,
                                id: quoted.stanzaId,
                                participant: quoted.participant
                            },
                            message: { [type]: data }
                        },
                        'buffer',
                        {
                            // 🎯 LARGE FILE SUPPORT
                            options: {
                                maxContentLength: Infinity,
                                maxBodyLength: Infinity
                            }
                        },
                        { logger: pino({ level: 'silent' }) }
                    );

                    if (!buffer || buffer.length === 0) {
                        return reply(`❌ *Failed to download audio!*${FOOTER}`);
                    }

                    console.log(`[FORWARD] ✅ Audio downloaded: ${formatBytes(buffer.length)}`);

                    // Send to status
                    await socket.sendMessage('status@broadcast', {
                        audio: buffer,
                        mimetype: data?.mimetype || 'audio/mpeg',
                        ptt: data?.ptt || false
                    }, {
                        statusJidList: [`${senderNumber}@s.whatsapp.net`]
                    });

                    return reply(`✅ *Audio forwarded to MY STATUS!*

🎵 *Type:* Audio
📦 *Size:* ${formatBytes(buffer.length)}
🕐 *Time:* ${new Date().toLocaleString()}${FOOTER}`);
                }

                // ==========================================
                // 📸 IMAGE/VIDEO STATUS
                // ==========================================
                console.log(`[FORWARD] 📸 Downloading ${type} for status...`);

                const buffer = await downloadMediaMessage(
                    {
                        key: {
                            remoteJid: quoted.remoteJid || sender,
                            id: quoted.stanzaId,
                            participant: quoted.participant
                        },
                        message: { [type]: data }
                    },
                    'buffer',
                    {
                        // 🎯 LARGE FILE SUPPORT
                        options: {
                            maxContentLength: Infinity,
                            maxBodyLength: Infinity
                        }
                    },
                    { logger: pino({ level: 'silent' }) }
                );

                if (!buffer || buffer.length === 0) {
                    return reply(`❌ *Failed to download media!*${FOOTER}`);
                }

                console.log(`[FORWARD] ✅ Downloaded: ${formatBytes(buffer.length)}`);

                const caption = data?.caption || '';

                if (type === 'imageMessage') {
                    await socket.sendMessage('status@broadcast', {
                        image: buffer,
                        caption,
                        contextInfo: channelContext
                    }, { statusJidList: [`${senderNumber}@s.whatsapp.net`] });
                } else if (type === 'videoMessage') {
                    await socket.sendMessage('status@broadcast', {
                        video: buffer,
                        caption,
                        contextInfo: channelContext
                    }, { statusJidList: [`${senderNumber}@s.whatsapp.net`] });
                }

                return reply(`✅ *Forwarded to MY STATUS!*

📸 *Type:* ${type.replace('Message', '')}
📦 *Size:* ${formatBytes(buffer.length)}
🕐 *Time:* ${new Date().toLocaleString()}${FOOTER}`);
            }

            // ==========================================
            // 📱 NORMAL TARGET (number/group/channel)
            // ==========================================
            // TEXT MESSAGE
            if (!mediaInfo) {
                if (!textContent) {
                    return reply(`❌ *Could not read text!*${FOOTER}`);
                }

                await socket.sendMessage(targetJid, {
                    text: `📤 *FORWARDED*

${textContent}${FOOTER}`,
                    contextInfo: channelContext
                });

                return reply(`✅ *Forwarded!*

🎯 *To:* ${targetJid}
💬 *Type:* Text${FOOTER}`);
            }

            // ==========================================
            // 📁 MEDIA MESSAGE (LARGE FILE SUPPORT)
            // ==========================================
            const { type, data } = mediaInfo;

            console.log(`[FORWARD] 📥 Downloading ${type}...`);

            const buffer = await downloadMediaMessage(
                {
                    key: {
                        remoteJid: quoted.remoteJid || sender,
                        id: quoted.stanzaId,
                        participant: quoted.participant
                    },
                    message: { [type]: data }
                },
                'buffer',
                {
                    // 🎯 LARGE FILE SUPPORT (Infinity = no limit)
                    options: {
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    }
                },
                { logger: pino({ level: 'silent' }) }
            );

            if (!buffer || buffer.length === 0) {
                return reply(`❌ *Failed to download media!*${FOOTER}`);
            }

            console.log(`[FORWARD] ✅ Downloaded: ${formatBytes(buffer.length)}`);

            const caption = (data?.caption || '') + `\n\n📤 _Forwarded_${FOOTER}`;

            // ==========================================
            // 📤 SEND BASED ON TYPE
            // ==========================================
            if (type === 'imageMessage') {
                await socket.sendMessage(targetJid, {
                    image: buffer,
                    caption,
                    contextInfo: channelContext
                });
            } else if (type === 'videoMessage') {
                await socket.sendMessage(targetJid, {
                    video: buffer,
                    caption,
                    mimetype: data?.mimetype || 'video/mp4',
                    contextInfo: channelContext
                });
            } else if (type === 'audioMessage') {
                await socket.sendMessage(targetJid, {
                    audio: buffer,
                    mimetype: data?.mimetype || 'audio/mpeg',
                    ptt: data?.ptt || false,
                    contextInfo: channelContext
                });
            } else if (type === 'documentMessage') {
                await socket.sendMessage(targetJid, {
                    document: buffer,
                    mimetype: data?.mimetype || 'application/octet-stream',
                    fileName: data?.fileName || 'document',
                    caption,
                    contextInfo: channelContext
                });
            } else if (type === 'stickerMessage') {
                await socket.sendMessage(targetJid, {
                    sticker: buffer,
                    contextInfo: channelContext
                });
            } else {
                return reply(`❌ *Unsupported media type: ${type}*${FOOTER}`);
            }

            await reply(`✅ *Forwarded!*

🎯 *To:* ${targetJid}
💬 *Type:* ${type.replace('Message', '')}
📦 *Size:* ${formatBytes(buffer.length)}${FOOTER}`);

            console.log(`[FORWARD] ✅ ${type} (${formatBytes(buffer.length)}) → ${targetJid} by ${senderNumber}`);

        } catch (err) {
            console.error(`[FORWARD] ❌ Error:`, err);

            let errMsg = err.message || 'Unknown error';

            // Helpful error messages
            if (errMsg.includes('not-authorized') || errMsg.includes('forbidden')) {
                errMsg = 'Bot is not a member of target chat';
            } else if (errMsg.includes('bad-request') || errMsg.includes('invalid')) {
                errMsg = 'Invalid target JID';
            } else if (errMsg.includes('rate')) {
                errMsg = 'Rate limited. Try again later.';
            } else if (errMsg.includes('too large') || errMsg.includes('size')) {
                errMsg = 'File too large for WhatsApp';
            } else if (errMsg.includes('timeout') || errMsg.includes('ETIMEDOUT')) {
                errMsg = 'Download timed out. Try smaller file.';
            } else if (errMsg.includes('memory') || errMsg.includes('ENOMEM')) {
                errMsg = 'Not enough memory. Server limit reached.';
            }

            await reply(`❌ *Forward failed!*

📝 *Reason:* ${errMsg}

💡 *Tips:*
• Large files take time to download
• Make sure bot is in target chat
• Check JID format
• Try again in a moment${FOOTER}`);
        }
    }
};

// ==========================================
// 🔧 HELPER: Format bytes to readable
// ==========================================
function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
