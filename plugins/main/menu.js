/**
 * NIMORA MD - Menu Plugin
 * Category: main
 */

const config = require('../../config');

// Category definitions (1-12)
const CATEGORIES = {
    1: {
        name: 'CONVERT',
        emoji: '🔄',
        commands: [
            'mp3tourl', 'dark', 'blur', 'toaudio', 'toptt', 'remini',
            'img2qr', 'removebg', 'toqr', 'subtr', 'splitmedia', 'surl',
            'tts', 'wame', 'img2url', 'fancy', 'trt', 'toimg', 'pdf', 'emomix'
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
            'setup', 'tgauth', 'tgconfig'
        ]
    },
    3: {
        name: 'MAIN',
        emoji: '⚡',
        commands: [
            'pair', 'logo', 'edit', 'tempmail', 'rename', 'bingen',
            'dictionary', 'readmore', 'device', 'newgroup', 'delgroup',
            'save', 'block', 'unblock', 'help', 'id', 'settings', 'apply',
            'defaultimg', 'defaultfooter', 'list', 'menu', 'alive', 'jid',
            'system', 'ping'
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

// Build a category menu text
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

// Build main menu
function buildMainMenu(botName, activeCount, followStatus) {
    let text = `
*👋 ${botName.toUpperCase()} 🥷🏻*
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

        // Send with bot image
        let sentMsg;
        try {
            sentMsg = await socket.sendMessage(sender, {
                image: { url: config.botImageUrl },
                caption: menuText,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            // Fallback: text only
            sentMsg = await socket.sendMessage(sender, {
                text: menuText,
                contextInfo: channelContext
            }, { quoted: msg });
        }

        // Track menu message for reply-by-number
        if (sentMsg?.key?.id) {
            menuMessageIds.set(sentMsg.key.id, { type: 'main', timestamp: Date.now() });
            // Cleanup old entries
            if (menuMessageIds.size > 100) {
                const oldest = menuMessageIds.keys().next().value;
                menuMessageIds.delete(oldest);
            }
        }

        // Send audio (welcome sound)
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
     */
    async handleReply(num, socket, msg, number, reply) {
        const { menuMessageIds, channelContext, FOOTER } = require('../../pair');

        const cat = CATEGORIES[num];
        if (!cat) return;

        const categoryText = buildCategoryMenu(num);
        if (!categoryText) return;

        const sentMsg = await socket.sendMessage(msg.key.remoteJid, {
            text: categoryText + '\n\n💡 *Reply 0 to go back to Main Menu*' + FOOTER,
            contextInfo: channelContext
        }, { quoted: msg });

        if (sentMsg?.key?.id) {
            menuMessageIds.set(sentMsg.key.id, { type: 'category', num, timestamp: Date.now() });
        }
    },

    /**
     * Handle "0" reply (back to main menu)
     */
    async handleBack(socket, msg, number, reply) {
        const botName = (await require('../../configdb').get('BOT_NAME', number)) || config.botName;
        const { activeSockets, menuMessageIds, channelContext } = require('../../pair');
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
            menuMessageIds.set(sentMsg.key.id, { type: 'main', timestamp: Date.now() });
        }
    }
};

// Export categories for other plugins
module.exports.CATEGORIES = CATEGORIES;
