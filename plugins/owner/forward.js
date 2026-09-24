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
        // 🔍 DEBUG LOG
        // ==========================================
        console.log(`\n[FORWARD] ═══════════════════════════`);
        console.log(`[FORWARD] 🚀 Command triggered`);
        console.log(`[FORWARD] Args:`, args);
        console.log(`[FORWARD] Sender:`, sender);
        console.log(`[FORWARD] SenderNumber:`, senderNumber);
        console.log(`[FORWARD] BotNumber:`, number);
        console.log(`[FORWARD] isOwner:`, isOwner, '| isMainOwner:', isMainOwner);
        console.log(`[FORWARD] Has quoted:`, !!(msg.message?.extendedTextMessage?.contextInfo?.quotedMessage));

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
        // 🎯 NORMALIZE TARGET (FIXED)
        // ==========================================
        let targetJid = target;

        const isStatusTarget = ['mystatus', 'status', 'story'].includes(target);
        const forceAudioStatus = args[1]?.toLowerCase() === 'audio';

        // Handle target → JID
        if (!isStatusTarget) {
            // Already has @ (JID format)
            if (targetJid.includes('@')) {
                // Keep as-is (e.g., 120363...@newsletter, 123456@g.us)
                console.log(`[FORWARD] JID format detected: ${targetJid}`);
            }
            // Pure number → user JID
            else if (/^[0-9]+$/.test(targetJid)) {
                targetJid = `${targetJid}@s.whatsapp.net`;
                console.log(`[FORWARD] Number → JID: ${targetJid}`);
            }
            // Number with dashes → group JID
            else if (/^[0-9-]+$/.test(targetJid)) {
                targetJid = `${targetJid}@g.us`;
                console.log(`[FORWARD] Group → JID: ${targetJid}`);
            }
            // Unknown format
            else {
                console.log(`[FORWARD] ⚠️ Unknown target format: ${targetJid}`);
            }
        } else {
            console.log(`[FORWARD] Status target: ${target}`);
        }

        console.log(`[FORWARD] Final targetJid: ${targetJid}`);

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

        console.log(`[FORWARD] MediaInfo:`, mediaInfo ? mediaInfo.type : 'text');
        console.log(`[FORWARD] Text content:`, textContent.substring(0, 50));

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
            // 📸 STATUS TARGET
            // ==========================================
            if (isStatusTarget) {
                // ... (status code - keep existing)
                if (!mediaInfo) {
                    return reply(`❌ *Status needs media!*${FOOTER}`);
                }

                const { type, data } = mediaInfo;
                const supportedStatusTypes = ['imageMessage', 'videoMessage', 'audioMessage'];

                if (!supportedStatusTypes.includes(type)) {
                    return reply(`❌ *Status only supports Image/Video/Audio!*${FOOTER}`);
                }

                // Audio status
                if (type === 'audioMessage' || forceAudioStatus) {
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
                        { options: { maxContentLength: Infinity, maxBodyLength: Infinity } },
                        { logger: pino({ level: 'silent' }) }
                    );

                    if (!buffer || buffer.length === 0) {
                        return reply(`❌ *Failed to download audio!*${FOOTER}`);
                    }

                    await socket.sendMessage('status@broadcast', {
                        audio: buffer,
                        mimetype: data?.mimetype || 'audio/mpeg',
                        ptt: data?.ptt || false
                    }, {
                        statusJidList: [`${senderNumber}@s.whatsapp.net`]
                    });

                    return reply(`✅ *Audio forwarded to MY STATUS!*${FOOTER}`);
                }

                // Image/Video status
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
                    { options: { maxContentLength: Infinity, maxBodyLength: Infinity } },
                    { logger: pino({ level: 'silent' }) }
                );

                if (!buffer || buffer.length === 0) {
                    return reply(`❌ *Failed to download media!*${FOOTER}`);
                }

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

                return reply(`✅ *Forwarded to MY STATUS!*${FOOTER}`);
            }

            // ==========================================
            // 📱 NORMAL TARGET
            // ==========================================
            // TEXT MESSAGE
            if (!mediaInfo) {
                if (!textContent) {
                    return reply(`❌ *Could not read text!*${FOOTER}`);
                }

                console.log(`[FORWARD] 📤 Sending TEXT to: ${targetJid}`);

                const sent = await socket.sendMessage(targetJid, {
                    text: `📤 *FORWARDED*

${textContent}${FOOTER}`,
                    contextInfo: channelContext
                });

                console.log(`[FORWARD] ✅ Send result:`, sent?.key?.id || 'NO ID');

                return reply(`✅ *Forwarded!*

🎯 *To:* ${targetJid}
💬 *Type:* Text
🆔 *ID:* ${sent?.key?.id || 'unknown'}${FOOTER}`);
            }

            // MEDIA MESSAGE
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
                { options: { maxContentLength: Infinity, maxBodyLength: Infinity } },
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
            let sent;

            if (type === 'imageMessage') {
                console.log(`[FORWARD] 📤 Sending IMAGE to: ${targetJid}`);
                sent = await socket.sendMessage(targetJid, {
                    image: buffer,
                    caption,
                    contextInfo: channelContext
                });
            } else if (type === 'videoMessage') {
                console.log(`[FORWARD] 📤 Sending VIDEO to: ${targetJid}`);
                sent = await socket.sendMessage(targetJid, {
                    video: buffer,
                    caption,
                    mimetype: data?.mimetype || 'video/mp4',
                    contextInfo: channelContext
                });
            } else if (type === 'audioMessage') {
                console.log(`[FORWARD] 📤 Sending AUDIO to: ${targetJid}`);
                sent = await socket.sendMessage(targetJid, {
                    audio: buffer,
                    mimetype: data?.mimetype || 'audio/mpeg',
                    ptt: data?.ptt || false,
                    contextInfo: channelContext
                });
            } else if (type === 'documentMessage') {
                console.log(`[FORWARD] 📤 Sending DOCUMENT to: ${targetJid}`);
                sent = await socket.sendMessage(targetJid, {
                    document: buffer,
                    mimetype: data?.mimetype || 'application/octet-stream',
                    fileName: data?.fileName || 'document',
                    caption,
                    contextInfo: channelContext
                });
            } else if (type === 'stickerMessage') {
                console.log(`[FORWARD] 📤 Sending STICKER to: ${targetJid}`);
                sent = await socket.sendMessage(targetJid, {
                    sticker: buffer,
                    contextInfo: channelContext
                });
            } else {
                return reply(`❌ *Unsupported media type: ${type}*${FOOTER}`);
            }

            console.log(`[FORWARD] ✅ Send result:`, sent?.key?.id || 'NO ID');

            await reply(`✅ *Forwarded!*

🎯 *To:* ${targetJid}
💬 *Type:* ${type.replace('Message', '')}
📦 *Size:* ${formatBytes(buffer.length)}
🆔 *ID:* ${sent?.key?.id || 'unknown'}${FOOTER}`);

            console.log(`[FORWARD] ═══════════════════════════\n`);

        } catch (err) {
            console.error(`[FORWARD] ❌ Error:`, err);
            console.error(`[FORWARD] ❌ Stack:`, err.stack);

            let errMsg = err.message || 'Unknown error';

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
// 🔧 HELPER: Format bytes
// ==========================================
function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
