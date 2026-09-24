/**
 * NIMORA MD - YouTube Song Downloader
 * Uses @distube/ytdl-core + yt-search (100% npm, no API)
 */

const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    name: 'song',
    aliases: ['music', 'ytaudio'],
    category: 'download',
    description: 'Download YouTube song (npm only)',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, pendingSelection, channelContext, FOOTER } = ctx;

        const query = args.join(' ');
        if (!query) return reply(`⚠️ Usage: .song [song name]${FOOTER}`);

        await reply(`🔍 Searching *${query}*... 🎶${FOOTER}`);

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return reply(`❌ Song not found!${FOOTER}`);

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

            // Download audio stream
            const audioStream = ytdl(video.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            });

            // Save to temp
            const tmpDir = path.join(__dirname, '../../tmp');
            await fs.ensureDir(tmpDir);

            const audioPath = path.join(tmpDir, `audio_${Date.now()}.mp3`);

            // Convert with ffmpeg
            const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

            await new Promise((resolve, reject) => {
                const ffmpeg = require('fluent-ffmpeg');
                ffmpeg.setFfmpegPath(ffmpegPath);

                ffmpeg(audioStream)
                    .audioBitrate(128)
                    .audioCodec('libmp3lame')
                    .format('mp3')
                    .save(audioPath)
                    .on('end', resolve)
                    .on('error', reject);
            });

            const buffer = await fs.readFile(audioPath);

            await socket.sendMessage(sender, {
                audio: buffer,
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                contextInfo: channelContext
            }, { quoted: msg });

            await fs.remove(audioPath).catch(() => {});

        } else if (choice === 2) {
            await reply(`📥 Downloading video... ⏳ (may take 1-2 min)${FOOTER}`);

            // Download video
            const tmpDir = path.join(__dirname, '../../tmp');
            await fs.ensureDir(tmpDir);

            const videoPath = path.join(tmpDir, `video_${Date.now()}.mp4`);

            await new Promise((resolve, reject) => {
                const writeStream = fs.createWriteStream(videoPath);
                const videoStream = ytdl(video.url, {
                    quality: 'highest',
                    filter: 'audioandvideo'
                });

                videoStream.pipe(writeStream);
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
                videoStream.on('error', reject);
            });

            const buffer = await fs.readFile(videoPath);

            await socket.sendMessage(sender, {
                video: buffer,
                caption: `🎬 *${video.title}*${FOOTER}`,
                contextInfo: channelContext
            }, { quoted: msg });

            await fs.remove(videoPath).catch(() => {});
        }
    } catch (e) {
        console.error('[SONG] Error:', e.message);
        await reply(`❌ Download failed: ${e.message}${FOOTER}`);
    }
}
