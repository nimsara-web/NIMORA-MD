/**
 * NIMORA MD - Text to Speech (TTS)
 * Category: convert
 * 
 * Pipeline: Text → Google TTS (MP3) → FFmpeg (OGG Opus) → WhatsApp Voice Note
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('util').promisify(require('child_process').exec);

// ==========================================
// 🎬 FFmpeg path (from @ffmpeg-installer)
// ==========================================
let FFMPEG_PATH = 'ffmpeg';
try {
    FFMPEG_PATH = require('@ffmpeg-installer/ffmpeg').path;
    console.log('[TTS] ✅ FFmpeg loaded:', FFMPEG_PATH);
} catch (e) {
    console.log('[TTS] ⚠️ @ffmpeg-installer not found, using system ffmpeg');
}

// ==========================================
// 🎤 TTS Command
// ==========================================
module.exports = {
    name: 'tts',
    aliases: ['say', 'speak'],
    category: 'convert',
    description: 'Text to speech (voice note)',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const text = args.join(' ').trim();
        if (!text) return reply(`⚠️ Usage: .tts [text]${FOOTER}`);

        if (text.length > 180) {
            return reply(`⚠️ *Text too long!*

📏 Max: 180 characters
📝 Yours: ${text.length}${FOOTER}`);
        }

        await reply(`🎤 Generating voice... ⏳${FOOTER}`);

        // Temp paths
        const tmpDir = path.join(__dirname, '../../tmp');
        await fs.ensureDir(tmpDir);

        const ts = Date.now();
        const mp3Path = path.join(tmpDir, `tts_${ts}.mp3`);
        const oggPath = path.join(tmpDir, `tts_${ts}.ogg`);

        try {
            // ==========================================
            // 1️⃣ Fetch MP3 from Google TTS
            // ==========================================
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

            const res = await axios.get(ttsUrl, {
                responseType: 'arraybuffer',
                timeout: 20000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://translate.google.com/',
                    'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,*/*;q=0.5',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });

            const mp3Buffer = Buffer.from(res.data);

            if (!mp3Buffer || mp3Buffer.length < 500) {
                console.log(`[TTS] ❌ MP3 too small: ${mp3Buffer?.length || 0} bytes`);
                return reply(`❌ TTS failed (empty audio)!${FOOTER}`);
            }

            console.log(`[TTS] ✅ MP3 fetched: ${mp3Buffer.length} bytes`);
            await fs.writeFile(mp3Path, mp3Buffer);

            // ==========================================
            // 2️⃣ Convert MP3 → OGG Opus
            // ==========================================
            const ffmpegCmd = `"${FFMPEG_PATH}" -i "${mp3Path}" ` +
                `-c:a libopus -b:a 48k -ar 48000 -ac 1 ` +
                `-vbr on -compression_level 10 -frame_duration 60 ` +
                `-application voip "${oggPath}" -y`;

            console.log(`[TTS] 🎬 Converting to OGG Opus...`);

            try {
                await exec(ffmpegCmd, { timeout: 30000 });

                const oggBuffer = await fs.readFile(oggPath);

                if (!oggBuffer || oggBuffer.length < 500) {
                    console.log(`[TTS] ⚠️ OGG too small, using MP3 fallback`);
                    return await sendMp3Fallback(socket, sender, msg, mp3Buffer, channelContext, FOOTER);
                }

                console.log(`[TTS] ✅ OGG Opus: ${oggBuffer.length} bytes`);

                // ✅ Send as voice note (PTT)
                await socket.sendMessage(sender, {
                    audio: oggBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    contextInfo: channelContext
                }, { quoted: msg });

                console.log(`[TTS] ✅ Voice note sent`);

            } catch (ffmpegErr) {
                console.error(`[TTS] ❌ FFmpeg failed:`, ffmpegErr.message);
                // Fallback: MP3
                await sendMp3Fallback(socket, sender, msg, mp3Buffer, channelContext, FOOTER);
            }

        } catch (e) {
            console.error(`[TTS] ❌ Error:`, e.message);
            await reply(`❌ TTS failed: ${e.message}${FOOTER}`);
        } finally {
            // Cleanup temp files
            fs.remove(mp3Path).catch(() => {});
            fs.remove(oggPath).catch(() => {});
        }
    }
};

// ==========================================
// 🔁 Fallback: Send MP3 as regular audio
// ==========================================
async function sendMp3Fallback(socket, sender, msg, mp3Buffer, channelContext, FOOTER) {
    try {
        console.log(`[TTS] 🔁 Fallback: sending MP3 (regular audio)`);
        await socket.sendMessage(sender, {
            audio: mp3Buffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: 'tts.mp3',
            contextInfo: channelContext
        }, { quoted: msg });
        console.log(`[TTS] ✅ Fallback sent`);
    } catch (e) {
        console.error(`[TTS] ❌ Fallback failed:`, e.message);
    }
}
