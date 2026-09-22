const yts = require('yt-search');
const axios = require('axios');
const config = require('../../config');
const { nimFetch, extractUrl } = require('./_helper');

module.exports = {
    name: 'song',
    aliases: ['music'],
    category: 'download',
    description: 'Download YouTube song (audio/video)',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, pendingSelection, channelContext, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .song [song name]${FOOTER}`);

        await reply(`🔍 Searching *${query}*... 🎶${FOOTER}`);

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return reply(`❌ Song not found!${FOOTER}`);

            // Set pending selection
            pendingSelection.set(sender, {
                type: 'song',
                url: video.url,
                title: video.title,
                timestamp: Date.now(),
                handler: async (choice, sock, origMsg, replyFn) => {
                    await handleDownload(choice, video, sock, sender, origMsg, replyFn, channelContext, FOOTER);
                }
            });

            await socket.sendMessage(sender, {
                image: { url: video.thumbnail },
                caption: `🎵 *SONG FOUND!*

📝 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views?.toLocaleString() || 'N/A'}
📅 *Uploaded:* ${video.ago}

*Reply with a number:*
1️⃣ - 🎵 Audio (MP3)
2️⃣ - 🎬 Video (MP4)

💡 _Reply within 2 minutes_${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};

async function handleDownload(choice, video, socket, sender, msg, reply, channelContext, FOOTER) {
    try {
        if (choice === 1) {
            await reply(`📥 Downloading audio... ⏳${FOOTER}`);

            const data = await nimFetch('/api/ytmp3', { url: video.url });
            const audioUrl = extractUrl(data, ['result.url', 'data.url', 'url']);

            if (!audioUrl) return reply(`❌ Audio download failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                contextInfo: channelContext
            }, { quoted: msg });

        } else if (choice === 2) {
            await reply(`📥 Downloading video... ⏳${FOOTER}`);

            const data = await nimFetch('/api/ytmp4-v2', { url: video.url });
            const videoUrl = extractUrl(data, ['result.url', 'data.url', 'url', 'result.download_url']);

            if (!videoUrl) return reply(`❌ Video download failed!${FOOTER}`);

            await socket.sendMessage(sender, {
                video: { url: videoUrl },
                caption: `🎬 *${video.title}*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });
        }
    } catch (e) {
        await reply(`❌ Error: ${e.message}${FOOTER}`);
    }
}
