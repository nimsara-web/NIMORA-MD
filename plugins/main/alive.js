const config = require('../../config');

// Lazy require to avoid circular dependency
function getPair() {
    return require('../../pair');
}

module.exports = {
    name: 'alive',
    aliases: ['status'],
    category: 'main',
    description: 'Check if bot is alive',

    async execute(ctx) {
        const { socket, msg, reply, number, sender, channelContext, FOOTER } = ctx;

        // ✅ Get socketCreationTime directly from pair module
        const pair = getPair();
        const socketCreationTime = pair.socketCreationTime || new Map();
        const activeSockets = pair.activeSockets || new Map();

        const botName = (await ctx.get('BOT_NAME', number)) || config.botName;
        const start = socketCreationTime.get(number) || Date.now();
        const uptime = Math.floor((Date.now() - start) / 1000);
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = Math.floor(uptime % 60);

        const aliveText = `👋 *${botName}* is online!

⏱️ *Uptime:* ${h}h ${m}m ${s}s
📊 *Active Bots:* ${activeSockets.size}
👨‍💻 *Creator:* Nimsara
📞 *Support:* +${config.supportNumber}

> 🔗 Web: ${config.websiteUrl}
> 📢 Channel: ${config.channelLink}${FOOTER}`;

        // Send image, fallback to text
        try {
            await socket.sendMessage(sender, {
                image: { url: config.botImageUrl },
                caption: aliveText,
                contextInfo: channelContext
            }, { quoted: msg });
        } catch (e) {
            try {
                await reply(aliveText);
            } catch (e2) {
                console.error('[ALIVE] Failed to send:', e2.message);
            }
        }

        // Send audio (optional, fail silently)
        await ctx.delay(1200);
        try {
            if (config.botAudioUrl && config.botAudioUrl.startsWith('http')) {
                await socket.sendMessage(sender, {
                    audio: { url: config.botAudioUrl },
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    contextInfo: channelContext
                }, { quoted: msg });
            }
        } catch (e) {
            console.log('[ALIVE] Audio send failed (ignored):', e.message);
        }
    }
};
