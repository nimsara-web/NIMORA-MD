/**
 * NIMORA MD - Forward Command (LID FIXED)
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

        // 🔍 DEBUG
        console.log(`\n[FORWARD] ═══════════════════════════`);
        console.log(`[FORWARD] 🚀 Command triggered`);
        console.log(`[FORWARD] Args:`, args);
        console.log(`[FORWARD] Sender:`, sender);
        console.log(`[FORWARD] SenderNumber:`, senderNumber);
        console.log(`[FORWARD] BotNumber:`, number);
        console.log(`[FORWARD] isOwner:`, isOwner, '| isMainOwner:', isMainOwner);

        // 🔒 OWNER CHECK
        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*${FOOTER}`);
        }

        // 📌 PARSE TARGET
        const target = args[0]?.toLowerCase();

        if (!target) {
            return reply(`📤 *FORWARD COMMAND*

*Usage:* Reply to a message + \`.forward [target]\`

*Examples:*
• \`.forward 94784280074\` — Number
• \`.forward mystatus\` — MY status
• \`.forward mystatus audio\` — Audio status
• \`.forward 120363...@newsletter\` — Channel
• \`.forward 123456@g.us\` — Group${FOOTER}`);
        }

        // 📥 QUOTED MESSAGE
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted || !quoted.quotedMessage) {
            return reply(`⚠️ *Please reply to a message!*${FOOTER}`);
        }

        // 🎯 NORMALIZE TARGET
        let targetJid = target;
        const isStatusTarget = ['mystatus', 'status', 'story'].includes(target);
        const forceAudioStatus = args[1]?.toLowerCase() === 'audio';

        if (!isStatusTarget) {
            if (targetJid.includes('@')) {
                console.log(`[FORWARD] JID as-is: ${targetJid}`);
            } else if (/^[0-9]+$/.test(targetJid)) {
                targetJid = `${targetJid}@s.whatsapp.net`;
            } else if (/^[0-9-]+$/.test(targetJid)) {
                targetJid = `${targetJid}@g.us`;
            }
        }

        console.log(`[FORWARD] Final targetJid: ${targetJid}`);

        // 📝 EXTRACT CONTENT
        const qMsg = unwrapMessage(quoted.quotedMessage);
        if (!qMsg) return reply(`❌ *Could not read quoted message!*${FOOTER}`);

        const mediaInfo = getMediaType(qMsg);
        const textContent = qMsg.conversation ||
                           qMsg.extendedTextMessage?.text ||
                           qMsg.imageMessage?.caption ||
                           qMsg.videoMessage?.caption ||
                           qMsg.documentMessage?.caption ||
                           '';

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
                if (!mediaInfo) {
                    return reply(`❌ *Status needs media!*${FOOTER}`);
                }

                const { type, data } = mediaInfo;
                const supportedTypes = ['imageMessage', 'videoMessage', 'audioMessage'];

                if (!supportedTypes.includes(type)) {
                    return reply(`❌ *Status only supports Image/Video/Audio!*${FOOTER}`);
                }

                // ==========================================
                // 🎯 FIX: Use BOT number, not senderNumber
                // ==========================================
                // WhatsApp LID system: senderNumber might be @lid (invalid)
                // Status එක bot number එකේ, ඒ නිසා bot number use කරන්න
                const statusJidList = [`${number}@s.whatsapp.net`];

                console.log(`[FORWARD] 📸 Status target: ${statusJidList.join(', ')}`);

                // ==========================================
                // 🎵 AUDIO STATUS
                // ==========================================
                if (type === 'audioMessage' || forceAudioStatus) {
                    console.log(`[FORWARD] 🎵 Downloading audio...`);

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

                    console.log(`[FORWARD] ✅ Audio: ${formatBytes(buffer.length)}`);

                    const sent = await socket.sendMessage('status@broadcast', {
                        audio: buffer,
                        mimetype: data?.mimetype || 'audio/mpeg',
                        ptt: data?.ptt || false
                    }, {
                        statusJidList: statusJidList
                    });

                    console.log(`[FORWARD] ✅ Status sent:`, sent?.key?.id || 'NO ID');

                    return reply(`✅ *Audio forwarded to MY STATUS!*

🎵 *Type:* Audio
📦 *Size:* ${formatBytes(buffer.length)}
🆔 *ID:* ${sent?.key?.id || 'unknown'}
🕐 *Time:* ${new Date().toLocaleString()}${FOOTER}`);
                }

                // ==========================================
                // 📸 IMAGE/VIDEO STATUS
                // ==========================================
                console.log(`[FORWARD] 📸 Downloading ${type}...`);

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

                const caption = data?.caption || '';

                let sent;
                if (type === 'imageMessage') {
                    sent = await socket.sendMessage('status@broadcast', {
                        image: buffer,
                        caption,
                        contextInfo: channelContext
                    }, { statusJidList: statusJidList });
                } else if (type === 'videoMessage') {
                    sent = await socket.sendMessage('status@broadcast', {
                        video: buffer,
                        caption,
                        contextInfo: channelContext
                    }, { statusJidList: statusJidList });
                }

                console.log(`[FORWARD] ✅ Status sent:`, sent?.key?.id || 'NO ID');

                return reply(`✅ *Forwarded to MY STATUS!*

📸 *Type:* ${type.replace('Message', '')}
📦 *Size:* ${formatBytes(buffer.length)}
🆔 *ID:* ${sent?.key?.id || 'unknown'}
🕐 *Time:* ${new Date().toLocaleString()}${FOOTER}`);
            }

            // ==========================================
            // 📱 NORMAL TARGET (number/group/channel)
            // ==========================================
            // TEXT
            if (!mediaInfo) {
                if (!textContent) {
                    return reply(`❌ *Could not read text!*${FOOTER}`);
                }

                console.log(`[FORWARD] 📤 Sending TEXT to: ${targetJid}`);

                const sent = await socket.sendMessage(targetJid, {
                    text: `📤 *FORWARDED*\n\n${textContent}${FOOTER}`,
                    contextInfo: channelContext
                });

                console.log(`[FORWARD] ✅ Send:`, sent?.key?.id || 'NO ID');

                return reply(`✅ *Forwarded!*

🎯 *To:* ${targetJid}
💬 *Type:* Text
🆔 *ID:* ${sent?.key?.id || 'unknown'}${FOOTER}`);
            }

            // MEDIA
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
                return reply(`❌ *Failed to download!*${FOOTER}`);
            }

            console.log(`[FORWARD] ✅ Downloaded: ${formatBytes(buffer.length)}`);

            const caption = (data?.caption || '') + `\n\n📤 _Forwarded_${FOOTER}`;

            let sent;
            if (type === 'imageMessage') {
                sent = await socket.sendMessage(targetJid, {
                    image: buffer,
                    caption,
                    contextInfo: channelContext
                });
            } else if (type === 'videoMessage') {
                sent = await socket.sendMessage(targetJid, {
                    video: buffer,
                    caption,
                    mimetype: data?.mimetype || 'video/mp4',
                    contextInfo: channelContext
                });
            } else if (type === 'audioMessage') {
                sent = await socket.sendMessage(targetJid, {
                    audio: buffer,
                    mimetype: data?.mimetype || 'audio/mpeg',
                    ptt: data?.ptt || false,
                    contextInfo: channelContext
                });
            } else if (type === 'documentMessage') {
                sent = await socket.sendMessage(targetJid, {
                    document: buffer,
                    mimetype: data?.mimetype || 'application/octet-stream',
                    fileName: data?.fileName || 'document',
                    caption,
                    contextInfo: channelContext
                });
            } else if (type === 'stickerMessage') {
                sent = await socket.sendMessage(targetJid, {
                    sticker: buffer,
                    contextInfo: channelContext
                });
            } else {
                return reply(`❌ *Unsupported: ${type}*${FOOTER}`);
            }

            console.log(`[FORWARD] ✅ Sent:`, sent?.key?.id || 'NO ID');
            console.log(`[FORWARD] ═══════════════════════════\n`);

            await reply(`✅ *Forwarded!*

🎯 *To:* ${targetJid}
💬 *Type:* ${type.replace('Message', '')}
📦 *Size:* ${formatBytes(buffer.length)}
🆔 *ID:* ${sent?.key?.id || 'unknown'}${FOOTER}`);

        } catch (err) {
            console.error(`[FORWARD] ❌ Error:`, err);
            console.error(`[FORWARD] ❌ Stack:`, err.stack);

            let errMsg = err.message || 'Unknown error';

            if (errMsg.includes('not-authorized') || errMsg.includes('forbidden')) {
                errMsg = 'Bot is not a member of target chat';
            } else if (errMsg.includes('bad-request') || errMsg.includes('invalid')) {
                errMsg = 'Invalid target JID';
            } else if (errMsg.includes('rate')) {
                errMsg = 'Rate limited';
            }

            await reply(`❌ *Forward failed!*

📝 *Reason:* ${errMsg}${FOOTER}`);
        }
    }
};

function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
