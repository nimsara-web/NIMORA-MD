const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'findtiktok',
    aliases: ['ttfind'],
    category: 'search',
    description: 'Find TikTok user info',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const username = args[0]?.replace('@', '');
        if (!username) return reply(`⚠️ Usage: .findtiktok [@username]${FOOTER}`);

        await reply(`🔍 Finding TikTok user *@${username}*... ⏳${FOOTER}`);

        try {
            const res = await axios.get(`${config.nimApiBase}/api/tiktok-user?apiKey=${config.nimApiKey}&username=${encodeURIComponent(username)}`, { timeout: 20000 });
            const d = res.data?.result || res.data?.data;

            if (!d) return reply(`❌ User not found!${FOOTER}`);

            let text = `🎵 *TIKTOK USER*\n\n`;
            text += `👤 *Username:* @${d.uniqueId || username}\n`;
            text += `📛 *Nickname:* ${d.nickname || 'N/A'}\n`;
            text += `📝 *Bio:* ${d.signature || 'N/A'}\n`;
            text += `👥 *Followers:* ${d.followerCount?.toLocaleString() || 'N/A'}\n`;
            text += `👣 *Following:* ${d.followingCount?.toLocaleString() || 'N/A'}\n`;
            text += `❤️ *Likes:* ${d.heartCount?.toLocaleString() || 'N/A'}\n`;
            text += `🎬 *Videos:* ${d.videoCount?.toLocaleString() || 'N/A'}\n`;

            if (d.avatarLarger) {
                await socket.sendMessage(sender, {
                    image: { url: d.avatarLarger },
                    caption: text + FOOTER,
                    contextInfo: channelContext
                }, { quoted: msg });
            } else {
                await reply(text + FOOTER);
            }
        } catch (e) {
            await reply(`❌ TikTok user lookup failed!${FOOTER}`);
        }
    }
};
