const yts = require('yt-search');
const { nimFetch, extractUrl } = require('./_helper');

module.exports = {
    name: 'youtube',
    aliases: ['yt', 'ytdl'],
    category: 'download',
    description: 'Download YouTube video/audio',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, pendingSelection, channelContext, FOOTER } = ctx;

        const url = args[0];
        if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
            return reply(`⚠️ Usage: .yt [YouTube URL]${FOOTER}`);
        }

        try {
            let videoInfo = null;
            const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
            if (videoId) videoInfo = await yts({ videoId });

            pendingSelection.set(sender, {
                type: 'youtube',
                url,
                title: videoInfo?.title || 'YouTube Video',
                timestamp: Date.now(),
                handler: async (choice, sock, origMsg, replyFn) => {
                    await handleYtDownload(choice, url, videoInfo, sock, sender, origMsg, replyFn, channelContext, FOOTER);
                }
            });

            const title = videoInfo?.title || 'YouTube Video';
            const duration = videoInfo?.timestamp || 'N/A';
            const thumbnail = videoInfo?.thumbnail;

            const caption = `🎬 *YOUTUBE VIDEO FOUND!*

📝 *Title:* ${title}
⏱️ *Duration:* ${duration}

*Reply with a number:*
1️⃣ - 🎬 Video (MP4)
2️⃣ - 🎵 Audio (MP3)

💡 _Reply within 2 minutes_${FOOTER}`;

            if (thumbnail) {
                await socket.sendMessage(sender, {
                    image: { url: thumbnail },
                    caption,
                    contextInfo: channelContext
                }, { quoted: msg });
            } else {
                await reply(caption);
            }
        } catch (e) {
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};

async function handleYtDownload(choice, url, info, socket, sender, msg, reply, channelContext, FOOTER) {
    try {
        if (choice === 1) {
            await reply(`📥 Downloading video... ⏳${FOOTER}`);
            const data = await nimFetch('/api/ytmp4-v2', { url });
            const videoUrl = extractUrl(data, ['result.url', 'data.url', 'url']);
            if (!videoUrl) return reply(`❌ Download failed!${FOOTER}`);
            await socket.sendMessage(sender, {
                video: { url: videoUrl },
                caption: `🎬 *${info?.title || 'Video'}*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });
        } else {
            await reply(`📥 Downloading audio... ⏳${FOOTER}`);
            const data = await nimFetch('/api/ytmp3', { url });
            const audioUrl = extractUrl(data, ['result.url', 'data.url', 'url']);
            if (!audioUrl) return reply(`❌ Download failed!${FOOTER}`);
            await socket.sendMessage(sender, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${info?.title || 'audio'}.mp3`,
                contextInfo: channelContext
            }, { quoted: msg });
        }
    } catch (e) {
        await reply(`❌ Error: ${e.message}${FOOTER}`);
    }
}
