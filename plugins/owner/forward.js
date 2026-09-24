/**
 * NIMORA MD - Forward Command
 * Category: owner
 * 
 * Forward a replied message to any chat/status/channel.
 * 
 * Usage:
 *   Reply + .forward [target]
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
• \`.forward 120363362308230584@newsletter\` — Forward to channel
• \`.forward 123456789-123456@g.us\` — Forward to group

⚠️ *Reply to any message* (text/media) with this command!${FOOTER}`);
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

        // Handle "mystatus" → bot's status
        const isStatusTarget = ['mystatus', 'status', 'story'].includes(target);

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
            ? '📸 MY STATUS'
            : `📱 ${targetJid}`;

        await reply(`📤 *Forwarding...*

🎯 *To:* ${targetDesc}
🔄 *Type:* ${mediaInfo ? mediaInfo.type.replace('Message', '') : 'Text'}${FOOTER}`);

        try {
            // ==========================================
            // 📸 STATUS TARGET
            // ==========================================
            if (isStatusTarget) {
                if (!mediaInfo) {
                    return reply(`❌ *Status needs media* (image/video)!

💡 Reply to an image or video.${FOOTER}`);
                }

                const { type, data } = mediaInfo;
                if (!['imageMessage', 'videoMessage'].includes(type)) {
                    return reply(`❌ *Status only supports image/video!*${FOOTER}`);
                }

                const buffer = await downloadMediaMessage(
                    {
                        key: {
                            remoteJid: quoted.remoteJid || sender,
                            id: quoted.stanzaId,
                            participant: quoted.participant
                        },
                        message: { [type]: data }
                    },
                    'buffer', {},
                    { logger: pino({ level: 'silent' }) }
                );

                if (!buffer || buffer.length === 0) {
                    return reply(`❌ *Failed to download media!*${FOOTER}`);
                }

                const caption = data?.caption || '';

                // Send to status
                if (type === 'imageMessage') {
                    await socket.sendMessage('status@broadcast', {
                        image: buffer,
                        caption,
                        contextInfo: channelContext
                    }, { statusJidList: [senderNumber + '@s.whatsapp.net'] });
                } else if (type === 'videoMessage') {
                    await socket.sendMessage('status@broadcast', {
                        video: buffer,
                        caption,
                        contextInfo: channelContext
                    }, { statusJidList: [senderNumber + '@s.whatsapp.net'] });
                }

                return reply(`✅ *Forwarded to MY STATUS!*

📸 Type: ${type.replace('Message', '')}
🕐 Time: ${new Date().toLocaleString()}${FOOTER}`);
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

            // MEDIA MESSAGE
            const { type, data } = mediaInfo;

            const buffer = await downloadMediaMessage(
                {
                    key: {
                        remoteJid: quoted.remoteJid || sender,
                        id: quoted.stanzaId,
                        participant: quoted.participant
                    },
                    message: { [type]: data }
                },
                'buffer', {},
                { logger: pino({ level: 'silent' }) }
            );

            if (!buffer || buffer.length === 0) {
                return reply(`❌ *Failed to download media!*${FOOTER}`);
            }

            const caption = (data?.caption || '') + `\n\n📤 _Forwarded_${FOOTER}`;

            // Send based on media type
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
💬 *Type:* ${type.replace('Message', '')}${FOOTER}`);

            console.log(`[FORWARD] ✅ ${type} → ${targetJid} by ${senderNumber}`);

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
            }

            await reply(`❌ *Forward failed!*

📝 *Reason:* ${errMsg}

💡 *Tips:*
• Make sure bot is in target group/channel
• Check JID format
• Try again in a moment${FOOTER}`);
        }
    }
};
