/**
 * Project: NIMORA MD - Pairing & Bot Core
 * Creator: Nimsara
 */

const {
    default: makeWASocket,
    useMultiFileAuthState,
    Browsers,
    delay,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    downloadMediaMessage
} = require('baileys');

const express = require('express');
const router = express.Router();
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');

const config = require('./config');
const Session = require('./Id');
const { get, input, ensureConfig, handleSettingUpdate } = require('./configdb');
const { getMessageBody, unwrapMessage, getMediaType } = require('./msg');
const { checkPaidUser } = require('./nimorapaid');
const { loadPlugins, getCommand, getAllCommands, getCategories } = require('./pluginLoader');

// ==========================================
// 📁 CONSTANTS
// ==========================================
const SESSION_BASE_PATH = path.join(__dirname, 'sessions');
const FOOTER = config.footer;

// ==========================================
// 🗂️ PER-SESSION STATE (in-memory)
// ==========================================
const activeSockets = new Map();
const socketCreationTime = new Map();
const reconnectAttempts = new Map();
const messageCache = new Map();
const deletedMessages = new Map();
const menuMessageIds = new Map();
const pendingSelection = new Map();

// Per-session owner list
let OWNER_LIST = [...config.mainOwnerNumbers];

// ==========================================
// 🔑 HELPERS
// ==========================================
function isOwnerNumber(number) {
    if (!number) return false;
    const clean = number.replace(/[^0-9]/g, '');
    return OWNER_LIST.includes(clean);
}

function isMainOwnerNumber(number) {
    if (!number) return false;
    const clean = number.replace(/[^0-9]/g, '');
    return config.mainOwnerNumbers.includes(clean);
}

async function loadOwnerList(botNumber) {
    try {
        const saved = await get('OWNER_LIST', botNumber);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                OWNER_LIST = [...new Set([...config.mainOwnerNumbers, ...parsed])];
                return;
            }
        }
        OWNER_LIST = [...config.mainOwnerNumbers];
    } catch (e) {
        OWNER_LIST = [...config.mainOwnerNumbers];
    }
}

async function humanDelay(min = 1200, max = 2500) {
    const d = Math.floor(Math.random() * (max - min + 1)) + min;
    await delay(d);
}

// ==========================================
// 📢 CHANNEL FORWARD CONTEXT
// ==========================================
function getChannelContext() {
    return {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: config.channelJid,
            newsletterName: config.channelName,
            serverMessageId: 100
        }
    };
}

// ==========================================
// 📦 MONGO AUTH STATE
// ==========================================
async function useMongoDBAuthState(number) {
    const sanitized = number.replace(/[^0-9]/g, '');
    const sessionDir = path.join(SESSION_BASE_PATH, `session_${sanitized}`);
    await fs.ensureDir(sessionDir);

    let dbData = await Session.findOne({ number: sanitized });
    const credsPath = path.join(sessionDir, 'creds.json');

    if (dbData && dbData.creds && Object.keys(dbData.creds).length > 0) {
        try {
            await fs.writeJson(credsPath, dbData.creds, { spaces: 2 });
        } catch (e) {
            await Session.deleteOne({ number: sanitized });
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const enhancedSaveCreds = async () => {
        try {
            await saveCreds();
            if (await fs.pathExists(credsPath)) {
                const raw = await fs.readFile(credsPath, 'utf8');
                if (raw && raw.trim()) {
                    const credsData = JSON.parse(raw);
                    if (credsData && Object.keys(credsData).length > 0) {
                        await Session.findOneAndUpdate(
                            { number: sanitized },
                            { creds: credsData, updatedAt: new Date(), lastSeen: new Date() },
                            { upsert: true, new: true }
                        );
                    }
                }
            }
        } catch (e) {
                    console.error(`❌ saveCreds error:`, e.message);
        }
    };

    return { state, saveCreds: enhancedSaveCreds };
}

// ==========================================
// 🧠 COMMAND CONTEXT BUILDER (FIXED)
// ==========================================
function buildContext(socket, msg, number, body, reply) {
    const sender = msg.key.remoteJid;
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const senderNumber = senderJid.split('@')[0].split(':')[0];
    const isGroup = sender.endsWith('@g.us');

    const prefix = body.match(/^[^\w\s]/) ? body[0] : '.';
    const args = body.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase() || '';

    // ==========================================
    // 🔑 OWNER PERMISSION LOGIC (FIXED)
    // ==========================================
    const isFromBot = msg.key.fromMe === true;

    // Check sender number
    const senderIsOwner = isOwnerNumber(senderNumber);
    const senderIsMainOwner = isMainOwnerNumber(senderNumber);

    // Check bot number (when message sent by bot itself)
    const botIsOwner = isOwnerNumber(number);
    const botIsMainOwner = isMainOwnerNumber(number);

    // Final permission:
    // - If from bot itself → use bot number's owner status
    // - Otherwise → use sender's owner status
    const finalIsOwner = isFromBot
        ? (botIsOwner || senderIsOwner)
        : senderIsOwner;

    const finalIsMainOwner = isFromBot
        ? (botIsMainOwner || senderIsMainOwner)
        : senderIsMainOwner;

    return {
        // Core
        socket, msg, number, body, reply,
        sender, senderJid, senderNumber, isGroup,
        prefix, args, command,

        // Config & Constants
        config,
        FOOTER,

        // Database
        Session,
        get, input, handleSettingUpdate,

        // Message helpers
        getMessageBody, unwrapMessage, getMediaType,
        downloadMediaMessage,

        // Channel
        channelContext: getChannelContext(),

        // Permissions (FIXED)
        isOwner: finalIsOwner,
        isMainOwner: finalIsMainOwner,

        // Debug info
        _debug: {
            senderNumber,
            botNumber: number,
            isFromBot,
            senderIsOwner,
            senderIsMainOwner,
            botIsOwner,
            botIsMainOwner,
        },

        // Shared state
        activeSockets,
        socketCreationTime,
        reconnectAttempts,
        messageCache,
        menuMessageIds,
        pendingSelection,
        deletedMessages,

        // Helpers
        delay,
        humanDelay,
    };
}

// ==========================================
// 🎯 COMMAND DISPATCHER
// ==========================================
async function dispatchCommand(ctx) {
    const cmd = getCommand(ctx.command);
    if (!cmd) return false;

    try {
        await cmd.execute(ctx);
    } catch (err) {
        console.error(`❌ Command "${ctx.command}" error:`, err);
        await ctx.reply(`❌ Command error: ${err.message}${FOOTER}`);
    }
    return true;
}

// ==========================================
// 🔌 SETUP COMMAND HANDLERS (per socket)
// ==========================================
function setupCommandHandlers(socket, number) {

    // ==========================================
    // 🗑️ ANTI-DELETE (messages.update)
    // ==========================================
    socket.ev.on('messages.update', async (updates) => {
        try {
            for (const { key, update } of updates) {
                const protocol = update?.protocolMessage || update?.message?.protocolMessage;
                let revokedId = null;

                if (protocol) {
                    if (protocol.type === 0 || protocol.type === 'REVOKE' || protocol.key) {
                        revokedId = protocol.key?.id || protocol.stanzaId;
                    }
                }
                if (!revokedId && update?.messageStubType === 1) revokedId = key?.id;
                if (!revokedId && update?.message === null && key?.id) revokedId = key.id;
                if (!revokedId) continue;

                const cached = messageCache.get(revokedId);
                if (!cached) continue;

                const chatJid = cached.key.remoteJid;
                const senderJid = cached.key.participant || cached.key.remoteJid;
                const text = getMessageBody(cached) || '[Media]';

                deletedMessages.set(chatJid, {
                    sender: senderJid,
                    text,
                    time: new Date().toLocaleString(),
                    timestamp: Date.now()
                });
            }
        } catch (e) {
            console.error('[ANTI-DELETE]', e.message);
        }
    });

    // ==========================================
    // 🔒 AUTO VVSAVE (Silent view-once saver)
    // ==========================================
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg || !msg.message) return;
        if (msg.key.remoteJid === 'status@broadcast') return;
        if (msg.key.fromMe) return;

        try {
            // Check if message has view-once
            const hasViewOnce =
                msg.message.viewOnceMessage ||
                msg.message.viewOnceMessageV2 ||
                msg.message.viewOnceMessageV2Extension;

            if (!hasViewOnce) return;

            // Check if auto-vvsave is enabled
            const autoEnabled = await get('VVSAVE_AUTO', number);
            if (autoEnabled !== 'on') return;

            // Get the view-once content
            let vvMsg = msg.message.viewOnceMessage?.message ||
                        msg.message.viewOnceMessageV2?.message ||
                        msg.message.viewOnceMessageV2Extension?.message;

            if (!vvMsg) return;

            // Detect media
            const mediaType = vvMsg.imageMessage ? 'imageMessage' :
                              vvMsg.videoMessage ? 'videoMessage' :
                              vvMsg.audioMessage ? 'audioMessage' : null;

            if (!mediaType) return;

            const mediaData = vvMsg[mediaType];
            const sender = msg.key.remoteJid;
            const senderJid = msg.key.participant || sender;
            const senderNumber = senderJid.split('@')[0].split(':')[0];

            // Silent react
            const emoji = await get('VVSAVE_EMOJI', number) || '👀';
            try {
                await socket.sendMessage(sender, {
                    react: { text: emoji, key: msg.key }
                });
            } catch (e) {}

            // Download
            try {
                const buffer = await downloadMediaMessage(
                    {
                        key: { remoteJid: sender, id: msg.key.id, participant: msg.key.participant },
                        message: { [mediaType]: mediaData }
                    },
                    'buffer',
                    {},
                    { logger: pino({ level: 'silent' }) }
                );

                if (!buffer || buffer.length === 0) return;

                // Send to bot's self-chat
                const selfJid = `${number}@s.whatsapp.net`;
                const chatType = sender.endsWith('@g.us') ? 'Group' : 'Inbox';

                const caption = `🔒 *AUTO-SAVED (Silent)*

👤 *From:* @${senderNumber}
📍 *Chat:* ${chatType}
🕐 *Time:* ${new Date().toLocaleString()}
${mediaData?.caption ? `💬 *Caption:* ${mediaData.caption}\n` : ''}
> _Auto-VVSave enabled_`;

                if (mediaType === 'imageMessage') {
                    await socket.sendMessage(selfJid, {
                        image: buffer,
                        caption,
                        mentions: [senderJid]
                    });
                } else if (mediaType === 'videoMessage') {
                    await socket.sendMessage(selfJid, {
                        video: buffer,
                        caption,
                        mentions: [senderJid]
                    });
                }

                console.log(`[AUTO-VVSAVE] ✅ Saved from ${senderNumber} to self-chat`);
            } catch (err) {
                console.log(`[AUTO-VVSAVE] ❌ Download failed:`, err.message);
            }
        } catch (e) {
            console.error('[AUTO-VVSAVE]', e.message);
        }
    });

    // ==========================================
    // 📩 MAIN MESSAGE HANDLER
    // ==========================================
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg || !msg.message) return;
        if (msg.key.remoteJid === 'status@broadcast') return;

        // Cache
        if (msg.key.id) {
            messageCache.set(msg.key.id, msg);
            if (messageCache.size > 500) {
                const keys = messageCache.keys();
                for (let i = 0; i < 250; i++) {
                    const k = keys.next().value;
                    if (k) messageCache.delete(k);
                }
            }
        }

        const body = getMessageBody(msg);
        if (!body) return;

        const sender = msg.key.remoteJid;
        const prefix = await get('PREFIX', number) || config.defaultPrefix;

        // Build reply helper
        const reply = async (content, quotedMsg = msg, react = true) => {
            let payload;
            if (typeof content === 'string') {
                payload = { text: content, contextInfo: getChannelContext() };
            } else {
                payload = {
                    ...content,
                    contextInfo: { ...(content.contextInfo || {}), ...getChannelContext() }
                };
            }
            const sent = await socket.sendMessage(sender, payload, { quoted: quotedMsg });

            if (react && body.startsWith(prefix)) {
                try {
                    const emojis = ['✅', '👌', '🔥', '⚡', '💫', '✔️'];
                    await socket.sendMessage(sender, {
                        react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: msg.key }
                    });
                } catch (e) {}
            }
            return sent;
        };

        const trimmedBody = body.trim();

        // ==========================================
        // ⏳ PENDING SELECTION HANDLER (CHECK FIRST!)
        // ==========================================
        if (pendingSelection.has(sender)) {
            const pending = pendingSelection.get(sender);

            if (Date.now() - pending.timestamp < 120000 && /^[1-9]$/.test(trimmedBody)) {
                pendingSelection.delete(sender);

                const handler = pending.handler;
                if (typeof handler === 'function') {
                    try {
                        await handler(parseInt(trimmedBody), socket, msg, reply);
                    } catch (e) {
                        console.error('[PENDING]', e);
                        await reply(`❌ Error: ${e.message}${FOOTER}`);
                    }
                }
                return;
            }
            if (Date.now() - pending.timestamp >= 120000) {
                pendingSelection.delete(sender);
            }
        }

        // ==========================================
        // 🔢 MENU NUMBER REPLY HANDLER (STRICT)
        // ==========================================
        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedStanza = ctxInfo?.stanzaId || '';

        const isMenuReply = quotedStanza && menuMessageIds.has(quotedStanza);

        if (!body.startsWith(prefix) && isMenuReply) {

            if (trimmedBody === '0') {
                const menuCmd = getCommand('menu');
                if (menuCmd && typeof menuCmd.handleBack === 'function') {
                    await menuCmd.handleBack(socket, msg, number, reply);
                    return;
                }
            }

            if (trimmedBody.match(/^([1-9]|1[0-2])$/)) {
                const menuCmd = getCommand('menu');
                if (menuCmd && typeof menuCmd.handleReply === 'function') {
                    await menuCmd.handleReply(parseInt(trimmedBody), socket, msg, number, reply);
                    return;
                }
            }
        }

        // ==========================================
        // 🤖 AUTO-REPLY (custom replies + basic)
        // ==========================================
        if (!msg.key.fromMe) {
            try {
                const autoReplyMode = await get('AUTOREPLY_MODE', number);

                if (autoReplyMode && autoReplyMode !== 'off') {
                    const isGroup = sender.endsWith('@g.us');
                    const shouldReply =
                        autoReplyMode === 'all' ||
                        (autoReplyMode === 'inbox' && !isGroup) ||
                        (autoReplyMode === 'group' && isGroup);

                    if (shouldReply) {
                        const textLower = body.toLowerCase().trim();

                        const savedList = await get('AUTOREPLY_LIST', number);
                        let customReplies = {};
                        try { customReplies = savedList ? JSON.parse(savedList) : {}; } catch (e) {}

                        if (customReplies[textLower]) {
                            await reply(customReplies[textLower] + FOOTER);
                            return;
                        }

                        const words = textLower.split(/\s+/);
                        const hasWord = w => words.includes(w);

                        if (hasWord('hi') || hasWord('hello') || hasWord('හායි')) {
                            await reply('Hi! 👋' + FOOTER);
                        } else if (hasWord('gm') || textLower === 'good morning') {
                            await reply('Good Morning 🌝' + FOOTER);
                        } else if (hasWord('gn') || textLower === 'good night') {
                            await reply('Good Night ✨' + FOOTER);
                        } else if (hasWord('bye')) {
                            await reply('Bye 🍻' + FOOTER);
                        }
                    }
                }
            } catch (e) {
                console.error('[AUTO-REPLY]', e.message);
            }
        }

        // ==========================================
        // 🚀 COMMAND EXECUTION
        // ==========================================
        if (!body.startsWith(prefix)) return;

        const ctx = buildContext(socket, msg, number, body, reply);

        // Mode check
        const mode = await get('BOT_MODE', number) || config.defaultMode;
        if (!ctx.isOwner) {
            if (mode === 'private') return;
            if (mode === 'group' && !ctx.isGroup) return;
            if (mode === 'inbox' && ctx.isGroup) return;
        }

        // Paid check
        const paid = await checkPaidUser(ctx.senderNumber);
        if (!paid) {
            return reply(`💎 *Premium Feature*\n\nThis command is for paid users only.\n📞 Contact owner: +${config.supportNumber}${FOOTER}`);
        }

        await dispatchCommand(ctx);
    });

    // ==========================================
    // 👋 GROUP WELCOME/GOODBYE
    // ==========================================
    socket.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update;
            const welcomeEnabled = await get(`WELCOME_${id}`, number);
            if (welcomeEnabled !== 'on') return;

            const meta = await socket.groupMetadata(id);
            for (const p of participants) {
                const name = p.split('@')[0];
                if (action === 'add') {
                    await socket.sendMessage(id, {
                        image: { url: config.botImageUrl },
                        text: `🎉 *WELCOME* @${name}!\n\n👋 Welcome to *${meta.subject}*${FOOTER}`,
                        mentions: [p],
                        contextInfo: getChannelContext()
                    });
                } else if (action === 'remove') {
                    await socket.sendMessage(id, {
                        text: `👋 *GOODBYE* @${name}!${FOOTER}`,
                        mentions: [p],
                        contextInfo: getChannelContext()
                    });
                }
            }
        } catch (e) {}
    });
}

// ==========================================
// 🟢 STATUS & PRESENCE HANDLERS
// ==========================================
function setupStatusAndPresenceHandlers(socket, number) {
    const getBotNumber = () => socket.user?.id ? socket.user.id.split(':')[0] : number;

    // Auto view / auto like status
    socket.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.message) continue;
            if (msg.key.remoteJid !== 'status@broadcast') continue;

            const botNum = getBotNumber();

            const autoView = await get('AUTO_VIEW_STATUS', botNum);
            if (autoView !== 'false' && autoView !== 'off') {
                try { await socket.readMessages([msg.key]); } catch (e) {}
            }

            const autoLike = await get('AUTO_LIKE_STATUS', botNum);
            if (autoLike === 'true' || autoLike === 'on') {
                try {
                    const emojis = ['❤️', '🔦', '👌', '✨', '🤍', '🌝'];
                    await socket.sendMessage('status@broadcast', {
                        react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: msg.key }
                    }, { statusJidList: [msg.key.participant] });
                } catch (e) {}
            }
        }
    });

    // Always online pulse
    setInterval(async () => {
        try {
            const botNum = getBotNumber();
            const alwaysOnline = await get('ALWAYS_ONLINE', botNum);
            if (alwaysOnline === 'false' || alwaysOnline === 'off') {
                await socket.sendPresenceUpdate('unavailable');
            } else {
                await socket.sendPresenceUpdate('available');
            }
        } catch (e) {}
    }, 60000);
}

// ==========================================
// 🚀 START BOT
// ==========================================
async function StartBot(number, res = null, isRestore = false) {
    const sanitized = number.replace(/[^0-9]/g, '');

    if (activeSockets.has(sanitized)) {
        if (res && !res.headersSent) return res.send({ status: 'already_connected', number: sanitized });
        return;
    }

    try {
        const { state, saveCreds } = await useMongoDBAuthState(sanitized);
        const logger = pino({ level: 'silent' });

        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            printQRInTerminal: false,
            logger,
            browser: Browsers.macOS('Safari'),
            keepAliveIntervalMs: 30000,
            connectTimeoutMs: 60000
        });

        sock.ev.on('creds.update', saveCreds);

        let connectMessageSent = false;

        const sendConnectMessage = async (currentSock, botNumber) => {
            if (connectMessageSent) return;
            connectMessageSent = true;
            try {
                const botName = await get('BOT_NAME', botNumber) || config.botName;
                const currentPrefix = await get('PREFIX', botNumber) || config.defaultPrefix;
                const ownJid = `${botNumber}@s.whatsapp.net`;

                const caption = `🎉 *${botName} CONNECTED* 🎉

> ✅ Your WhatsApp Bot is now online!

• Name: *${botName}*
• Number: *${botNumber}*
• Prefix: *${currentPrefix}*

> Type *${currentPrefix}menu* to view commands.

> 🔗 Web: ${config.websiteUrl}
> 📢 Channel: ${config.channelLink}${FOOTER}`;

                let imageSent = false;
                if (config.botImageUrl && config.botImageUrl.startsWith('http')) {
                    try {
                        await currentSock.sendMessage(ownJid, {
                            image: { url: config.botImageUrl },
                            caption,
                            contextInfo: getChannelContext()
                        });
                        imageSent = true;
                        console.log(`[CONNECT MSG] ✅ Image sent to ${botNumber}`);
                    } catch (err) {
                        console.log(`[CONNECT MSG] ⚠️ Image failed:`, err.message);
                    }
                }

                if (!imageSent) {
                    await currentSock.sendMessage(ownJid, {
                        text: caption,
                        contextInfo: getChannelContext()
                    });
                    console.log(`[CONNECT MSG] ✅ Text sent to ${botNumber}`);
                }

                await delay(1500);

                if (config.botAudioUrl && config.botAudioUrl.startsWith('http')) {
                    try {
                        await currentSock.sendMessage(ownJid, {
                            audio: { url: config.botAudioUrl },
                            mimetype: 'audio/mpeg',
                            ptt: false,
                            contextInfo: getChannelContext()
                        });
                        console.log(`[CONNECT MSG] ✅ Audio sent to ${botNumber}`);
                    } catch (err) {
                        console.log(`[CONNECT MSG] ⚠️ Audio failed (ignored):`, err.message);
                    }
                }

            } catch (err) {
                console.log(`[CONNECT MSG] ❌`, err.message);
                connectMessageSent = false;
            }
        };

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                console.log(`✅ Bot connected: ${sanitized}`);
                reconnectAttempts.set(sanitized, 0);

                await loadOwnerList(sanitized);
                await ensureConfig(sanitized);

                socketCreationTime.set(sanitized, Date.now());
                activeSockets.set(sanitized, sock);

                setTimeout(() => sendConnectMessage(sock, sanitized), 3000);

                if (res && !res.headersSent) {
                    return res.send({ status: 'connected', number: sanitized });
                }

            } else if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode;
                console.log(`⚠️ Connection closed: ${sanitized}, code: ${code}`);
                activeSockets.delete(sanitized);
                socketCreationTime.delete(sanitized);

                if (code === DisconnectReason.loggedOut || code === 401) {
                    console.log(`🚪 Session logged out: ${sanitized}. Cleaning up...`);
                    await Session.deleteOne({ number: sanitized }).catch(() => {});
                    await fs.remove(path.join(SESSION_BASE_PATH, `session_${sanitized}`)).catch(() => {});
                    reconnectAttempts.delete(sanitized);
                    console.log(`✅ Cleanup done for ${sanitized}. User must re-pair.`);
                }
                else if (code === DisconnectReason.restartRequired || code === 515) {
                    console.log(`🔄 Restart required for ${sanitized}. Reconnecting...`);
                    setTimeout(() => StartBot(sanitized, null, true), 2000);
                }
                else {
                    const attempts = (reconnectAttempts.get(sanitized) || 0) + 1;
                    reconnectAttempts.set(sanitized, attempts);
                    const delayTime = Math.min(3000 * Math.pow(1.5, attempts - 1), 60000);
                    console.log(`🔄 Reconnecting ${sanitized} in ${delayTime}ms (attempt ${attempts})`);
                    setTimeout(() => StartBot(sanitized, null, true), delayTime);
                }
            }
        });

        setupCommandHandlers(sock, sanitized);
        setupStatusAndPresenceHandlers(sock, sanitized);

        if (!sock.authState.creds.registered) {
            if (isRestore) return;
            await delay(3000);
            try {
                let code = await sock.requestPairingCode(sanitized);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                if (res && !res.headersSent) res.send({ code });
                console.log(`✅ Pair code for ${sanitized}: ${code}`);
            } catch (err) {
                if (res && !res.headersSent) return res.status(500).send({ error: err.message });
            }
        } else {
            if (res && !res.headersSent) return res.send({ status: 'already_registered', number: sanitized });
        }

    } catch (error) {
        console.error(`❌ StartBot error:`, error.message);
        if (res && !res.headersSent) return res.status(500).send({ error: error.message });
    }
}

// ==========================================
// 🔄 RESTORE SESSIONS ON STARTUP
// ==========================================
async function restoreExistingSessions() {
    try {
        console.log('🔍 Checking for existing sessions...');
        const all = await Session.find({});
        if (all.length === 0) {
            console.log('⏹️ No sessions found.');
            return;
        }

        console.log(`📋 Found ${all.length} session(s). Restoring...`);
        for (const s of all) {
            if (s.number && s.creds && Object.keys(s.creds).length > 0) {
                if (activeSockets.has(s.number)) continue;
                try {
                    await StartBot(s.number, null, true);
                    await delay(2000);
                } catch (e) {
                    console.error(`❌ Restore ${s.number}:`, e.message);
                }
            }
        }
        console.log('✅ Restore complete.');
    } catch (e) {
        console.error('❌ Restore error:', e.message);
    }
}

// ==========================================
// 🛣️ API ROUTES
// ==========================================

// Pair / connect
router.get('/', async (req, res) => {
    const { number } = req.query;
    if (!number) return res.status(400).send({ error: 'Phone number required!' });
    try {
        const sanitized = number.replace(/[^0-9]/g, '');
        const existing = await Session.findOne({ number: sanitized });
        if (existing && existing.creds && Object.keys(existing.creds).length > 0) {
            if (!activeSockets.has(sanitized)) {
                await StartBot(number, res, true);
                return;
            }
        }
        await StartBot(number, res, false);
    } catch (e) {
        if (!res.headersSent) res.status(500).send({ error: e.message });
    }
});

// Sessions list
router.get('/sessions', async (req, res) => {
    try {
        const all = await Session.find({});
        const active = Array.from(activeSockets.keys());
        res.send({
            total: all.length,
            activeCount: active.length,
            active,
            sessions: all.map(s => ({
                number: s.number,
                isActive: active.includes(s.number)
            }))
        });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Reconnect
router.post('/reconnect', async (req, res) => {
    const { number } = req.body || req.query;
    if (!number) return res.status(400).send({ error: 'Phone number required!' });
    const sanitized = number.replace(/[^0-9]/g, '');
    try {
        const s = await Session.findOne({ number: sanitized });
        if (!s) return res.status(404).send({ error: 'No session found.' });
        if (activeSockets.has(sanitized)) return res.send({ status: 'already_connected' });
        await StartBot(sanitized, null, true);
        res.send({ status: 'reconnect_initiated' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    const { number } = req.body || req.query;
    if (!number) return res.status(400).send({ error: 'Phone number required!' });
    const sanitized = number.replace(/[^0-9]/g, '');
    try {
        if (activeSockets.has(sanitized)) {
            const sock = activeSockets.get(sanitized);
            try { await sock.logout(); await sock.end(); } catch (e) {}
            activeSockets.delete(sanitized);
            socketCreationTime.delete(sanitized);
        }
        await Session.deleteOne({ number: sanitized });
        await fs.remove(path.join(SESSION_BASE_PATH, `session_${sanitized}`));
        res.send({ status: 'logged_out', number: sanitized });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// ==========================================
// 📊 STATS (for website)
// ==========================================
router.get('/stats', async (req, res) => {
    try {
        const all = await Session.find({});
        const active = Array.from(activeSockets.keys());

        let totalUptime = 0;
        active.forEach(n => {
            const start = socketCreationTime.get(n);
            if (start) totalUptime += (Date.now() - start);
        });

        res.json({
            botName: config.botName,
            creator: config.ownerName,
            totalSessions: all.length,
            activeCount: active.length,
            activeNumbers: active.map(n => `+${n}`),
            avgUptime: active.length ? Math.floor(totalUptime / active.length / 1000) : 0,
            uptime: process.uptime()
        });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// ==========================================
// ⚙️ CONFIG (for website)
// ==========================================
router.get('/config', async (req, res) => {
    res.json({
        botName: config.botName,
        botImageUrl: config.botImageUrl,
        botAudioUrl: config.botAudioUrl,
        websiteLogoUrl: config.websiteLogoUrl,
        channelLink: config.channelLink,
        websiteUrl: config.websiteUrl,
        supportNumber: config.supportNumber,
        ownerName: config.ownerName
    });
});

// ==========================================
// 🚀 INITIALIZE PLUGINS + RESTORE SESSIONS
// ==========================================
(async () => {
    try {
        await new Promise(resolve => {
            if (mongoose.connection.readyState === 1) resolve();
            else mongoose.connection.once('open', resolve);
        });

        await loadPlugins();
        await delay(3000);
        await restoreExistingSessions();
    } catch (e) {
        console.error('Init error:', e.message);
    }
})();

// ==========================================
// 📤 EXPORTS
// ==========================================
module.exports = router;
module.exports.activeSockets = activeSockets;
module.exports.socketCreationTime = socketCreationTime;
module.exports.reconnectAttempts = reconnectAttempts;
module.exports.messageCache = messageCache;
module.exports.getChannelContext = getChannelContext;
module.exports.isOwnerNumber = isOwnerNumber;
module.exports.isMainOwnerNumber = isMainOwnerNumber;
module.exports.StartBot = StartBot;
module.exports.FOOTER = FOOTER;
module.exports.SESSION_BASE_PATH = SESSION_BASE_PATH;
module.exports.menuMessageIds = menuMessageIds;
module.exports.pendingSelection = pendingSelection;
module.exports.deletedMessages = deletedMessages;
