/**
 * NIMORA MD - Menu Plugin
 * Category: main
 */

const config = require('../../config');

// ==========================================
// 📦 LAZY REQUIRE HELPERS (avoid circular dependency)
// ==========================================
function getPairModule() {
    return require('../../pair');
}

// ==========================================
// 📂 CATEGORY DEFINITIONS (1-12)
// ==========================================
const CATEGORIES = {
    1: {
        name: 'CONVERT',
        emoji: '🔄',
        commands: [
            'mp3tourl', 'dark', 'blur', 'toaudio', 'toptt', 'remini',
            'img2qr', 'removebg', 'toqr', 'subtr', 'splitmedia', 'surl',
            'tts', 'wame', 'img2url', 'fancy', 'trt', 'singlish',
            'toimg', 'pdf', 'emomix'
        ]
    },
    2: {
        name: 'OWNER',
        emoji: '👑',
        commands: [
            'removesticker', 'resetsticker', 'getsticker', 'addsticker',
            'addbad', 'resetbad', 'getbad', 'resetvoice', 'removevoice',
            'getvoice', 'addvoice', 'replacereply', 'removereply', 'getreply',
            'resetreply', 'addreply', 'update', 'getpp', 'enc', 'dec', 'boom',
            'vv', 'tovv', 'send', 'deljid', 'dp', 'sendtag', 'sendmsg',
            'remove', 'backup', 'restore', 'reset', 'note', 'myenv', 'dsn',
            'report', 'quote', 'alljid', 'restart', 'join', 'about', 'theme',
            'addseedr', 'addcmd', 'getcmd', 'delcmd', 'resetcmd', 'eval',
            'setup', 'tgauth', 'tgconfig',
            'vvsave', 'vvsaveauto', 'save',
            'setbotname', 'delbotname',
            'setlogo', 'dellogo',           // ← ADD
            'statussave', 'statusauto'
        ]
    },
    3: {
        name: 'MAIN',
        emoji: '⚡',
        commands: [
            'pair', 'logo', 'edit', 'tempmail', 'rename', 'bingen',
            'dictionary', 'readmore', 'device', 'newgroup', 'delgroup',
            'savemedia', 'block', 'unblock', 'help', 'id', 'settings', 'apply',
            'defaultimg', 'defaultfooter', 'list', 'menu', 'alive', 'jid',
            'system', 'ping', 'whoami', 'nodelet', 'remsg',
            'ewanna'                         // ← ADD
        ]
    },
    4: {
        name: 'MATHTOOL',
        emoji: '🧮',
        commands: ['mathstep', 'math', 'cal']
    },
    5: {
        name: 'DOWNLOAD',
        emoji: '📥',
        commands: [
            'tgvideo', 'downurl', 'threads', 'twitter', 'pinterest',
            'pastpaper', 'teradl', 'gitclone', 'tiktok', 'fb', 'ig', 'apk',
            'gdrive', 'mediafire', 'ss', 'video', 'song', 'seedr', 'anime',
            'sisub', 'mega', 'movie', 'xvdl', 'tgup'
        ]
    },
    6: {
        name: 'SEARCH',
        emoji: '🔍',
        commands: [
            'tiktoksearch', 'findtiktok', 'findapk', 'pixabay', 'unsplash',
            'ip', 'cric', 'find', 'yts', 'npm', 'wabeta', 'movieinfo',
            'weather', 'lyrics', 'git'
        ]
    },
    7: {
        name: 'AI',
        emoji: '🤖',
        commands: ['imagine', 'ai']
    },
    8: {
        name: 'GROUP',
        emoji: '👥',
        commands: [
            'gdp', 'automute', 'timer', 'gsetting', 'safemode', 'ingsettings',
            'ban', 'unban', 'invite', 'mute', 'unmute', 'promote', 'demote',
            'kick', 'add', 'hidetag', 'tagall', 'gdesc', 'gname', 'left',
            'antispam', 'del', 'delopt'
        ]
    },
    9: {
        name: 'CHANNEL',
        emoji: '📢',
        commands: ['cinfo', 'cupd', 'creact', 'csong', 'ctiktok']
    },
    10: {
        name: 'GAME',
        emoji: '🎮',
        commands: ['xo', 'delxo', 'guess', 'trivia', 'chess', 'hangman', 'scramble', 'slot']
    },
    11: {
        name: 'STICKER',
        emoji: '🎨',
        commands: ['attp', 'ttp', 'searchsticker', 'sticker', 'steal']
    },
    12: {
        name: 'SUBBOT',
        emoji: '🤖',
        commands: [
            'subcheck', 'subbot', 'getsubbot', 'delsubbot',
            'delallsubbot', 'restartsubbot', 'restartallsubbot', 'helpsubbot'
        ]
    }
};

// ==========================================
// 🎨 MENU BUILDERS
// ==========================================

function buildCategoryMenu(num) {
    const cat = CATEGORIES[num];
    if (!cat) return null;

    let text = `╭━━━〔 ${cat.emoji} ${cat.name} 〕━━━┈\n`;
    cat.commands.forEach(cmd => {
        text += `│► .${cmd}\n`;
    });
    text += `╰━━━━━━━━━━━━━━━━━━━┈`;

    return text;
}

function buildMainMenu(botName, activeCount, followStatus) {
    let text = `*👋 ${botName.toUpperCase()} 🥷🏻*
*-- The Mini WhatsApp Bot Experience --*

> © ᴄʀᴇᴀᴛᴏʀ ʙY ɴɪᴍꜱᴀʀᴀ 🥷🏻
> 🪀 Contact - 0784280074

─────────────────────
*BOT STATUS 👾*
> Bot Name : ${botName}
> Activers : ${activeCount}
> Channel : ${followStatus}
> Bot Creator : NIMSARA
─────────────────────

*╭─\`🎈 𝗠𝗔𝗜𝗡 𝗠𝗘𝗡𝗨 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦\`┤⭓*
*┃*
*┃ 1️⃣ - 🔄 CONVERT*
*┃ 2️⃣ - 👑 OWNER*
*┃ 3️⃣ - ⚡ MAIN*
*┃ 4️⃣ - 🧮 MATHTOOL*
*┃ 5️⃣ - 📥 DOWNLOAD*
*┃ 6️⃣ - 🔍 SEARCH*
*┃ 7️⃣ - 🤖 AI*
*┃ 8️⃣ - 👥 GROUP*
*┃ 9️⃣ - 📢 CHANNEL*
*┃ 🔟 - 🎮 GAME*
*┃ 1️⃣1️⃣ - 🎨 STICKER*
*┃ 1️⃣2️⃣ - 🤖 SUBBOT*
*┃*
*╰──────────────────────*

💡 *Reply to this message with a number!*

> 🔗 Web: ${config.websiteUrl}

> *📢 FOLLOW CHANNEL :- ${config.channelLink}*

> _© ᴄʀᴇᴀᴛᴏʀ ʙY ɴɪᴍꜱᴀʀᴀ 🥷🏻_`;

    return text.trim();
}

// ==========================================
// 🎯 MENU COMMAND
// ==========================================

module.exports = {
    name: 'menu',
    aliases: ['allmenu', 'help'],
    category: 'main',
    description: 'Show bot menu',

    async execute(ctx) {
        const { socket, msg, reply, number, sender, activeSockets, menuMessageIds, channelContext, FOOTER } = ctx;

        const botName = (await ctx.get('BOT_NAME', number)) || config.botName;
        const followStatus = '✅ Connected';

        const menuText = buildMainMenu(botName, activeSockets.size, followStatus);

        // Send with bot image, fallback to text
        let sentMsg;
        try {
            sentMsg = await socket.sendMessage(sender, {
                image: { url: config.botImageUrl },
                caption: menuText,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            sentMsg = await socket.sendMessage(sender, {
                text: menuText,
                contextInfo: channelContext
            }, { quoted: msg });
        }

        // Track menu message for reply-by-number
        if (sentMsg?.key?.id) {
            menuMessageIds.set(sentMsg.key.id, { type: 'main', timestamp: Date.now() });

            // Cleanup old entries (keep last 100)
            if (menuMessageIds.size > 100) {
                const oldest = menuMessageIds.keys().next().value;
                menuMessageIds.delete(oldest);
            }
        }

        // Send welcome audio
        await ctx.delay(1500);
        try {
            if (config.botAudioUrl) {
                await socket.sendMessage(sender, {
                    audio: { url: config.botAudioUrl },
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    contextInfo: channelContext
                }, { quoted: msg });
            }
        } catch (e) {}
    },

    /**
     * Handle reply-by-number (called from pair.js)
     * User replies with 1-12 to a menu message
     */
    async handleReply(num, socket, msg, number, reply) {
        // 🔑 Lazy require to avoid circular dependency
        const pair = getPairModule();
        const menuMessageIds = pair.menuMessageIds;
        const channelContext = pair.getChannelContext();
        const FOOTER = pair.FOOTER;

        const cat = CATEGORIES[num];
        if (!cat) return;

        const categoryText = buildCategoryMenu(num);
        if (!categoryText) return;

        const sentMsg = await socket.sendMessage(msg.key.remoteJid, {
            text: categoryText + '\n\n💡 *Reply 0 to go back to Main Menu*' + FOOTER,
            contextInfo: channelContext
        }, { quoted: msg });

        if (sentMsg?.key?.id) {
            menuMessageIds.set(sentMsg.key.id, {
                type: 'category',
                num,
                timestamp: Date.now()
            });

            // Cleanup
            if (menuMessageIds.size > 100) {
                const oldest = menuMessageIds.keys().next().value;
                menuMessageIds.delete(oldest);
            }
        }
    },

    /**
     * Handle "0" reply → back to main menu
     */
    async handleBack(socket, msg, number, reply) {
        // 🔑 Lazy require to avoid circular dependency
        const pair = getPairModule();
        const activeSockets = pair.activeSockets;
        const menuMessageIds = pair.menuMessageIds;
        const channelContext = pair.getChannelContext();

        const { get } = require('../../configdb');
        const botName = (await get('BOT_NAME', number)) || config.botName;
        const menuText = buildMainMenu(botName, activeSockets.size, '✅ Connected');

        let sentMsg;
        try {
            sentMsg = await socket.sendMessage(msg.key.remoteJid, {
                image: { url: config.botImageUrl },
                caption: menuText,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            sentMsg = await socket.sendMessage(msg.key.remoteJid, {
                text: menuText,
                contextInfo: channelContext
            }, { quoted: msg });
        }

        if (sentMsg?.key?.id) {
            menuMessageIds.set(sentMsg.key.id, {
                type: 'main',
                timestamp: Date.now()
            });

            // Cleanup
            if (menuMessageIds.size > 100) {
                const oldest = menuMessageIds.keys().next().value;
                menuMessageIds.delete(oldest);
            }
        }
    },

    // Export for other plugins
    CATEGORIES,
    buildCategoryMenu,
    buildMainMenu
};

// Export categories separately for plugins that import menu.js
module.exports.CATEGORIES = CATEGORIES;
