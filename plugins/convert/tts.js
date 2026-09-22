/**
 * NIMORA MD - Text to Speech (TTS)
 * Category: convert
 * 
 * Converts text → MP3 (Google TTS) → OGG Opus (ffmpeg) → WhatsApp voice note
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// ==========================================
// 🎬 Get FFmpeg path (from @ffmpeg-installer or system)
// ==========================================
let FFMPEG_PATH = 'ffmpeg';
try {
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    FFMPEG_PATH = ffmpegInstaller.path;
    console.log('[TTS] ✅ Using ffmpeg from @ffmpeg-installer');
} catch (e) {
    console.log('[TTS] ⚠️ Using system ffmpeg (may not work on Render)');
}

module.exports = {
    name: 'tts',
    aliases: ['say', 'speak'],
    category: 'convert',
    description: 'Text to speech (voice note)',

    async execute(ctx) {
        const { args, reply, socket, msg, sender, channelContext, FOOTER } = ctx;

        const text = args.join(' ');
        if (!text) return reply(`⚠️ Usage: .tts [text]${FOOTER}`);

        await reply(`🎤 Generating voice... ⏳${FOOTER}`);

        // Setup tmp directory
        const tmpDir = path.join(__dirname, '../../tmp');
        await fs.ensureDir(tmpDir);

        const timestamp = Date.now();
        const mp3Path = path.join(tmpDir, `tts_${timestamp}.mp3`);
        const oggPath = path.join(tmpDir, `tts_${timestamp}.ogg`);

        try {
            // ==========================================
            // 1️⃣ Generate MP3 from Google TTS
            // ==========================================
            const cleanText = text.substring(0, 180);
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=en&client=tw-ob`;

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
                return reply(`❌ TTS failed (audio too small)!${FOOTER}`);
            }

            console.log(`[TTS] ✅ Got MP3: ${mp3Buffer.length} bytes`);

            // Save MP3 to disk
            await fs.writeFile(mp3Path, mp3Buffer);

            // ==========================================
            // 2️⃣ Convert MP3 → OGG Opus (voice note format)
            // ==========================================
            try {
                const ffmpegCmd = `"${FFMPEG_PATH}" -i "${mp3Path}" -c:a libopus -b:a 48k -ar 48000 -ac 1 -vbr on -compression_level 10 -frame_duration 60 -application voip "${oggPath}" -y`;

                console.log(`[TTS] 🎬 Converting to OGG Opus...`);
                await execPromise(ffmpegCmd, { timeout: 30000 });

                const oggBuffer = await fs.readFile(oggPath);

                if (!oggBuffer || oggBuffer.length < 500) {
                    console.log(`[TTS] ❌ OGG too small: ${oggBuffer?.length || 0} bytes`);
                    // Fallback: send MP3 as regular audio (not PTT)
                    return await sendFallbackMp3(socket, sender, msg, mp3Buffer, channelContext, FOOTER);
                }

                console.log(`[TTS] ✅ Got OGG Opus: ${oggBuffer.length} bytes`);

                // ✅ Send as voice note (PTT)
                await socket.sendMessage(sender, {
                    audio: oggBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    contextInfo: channelContext
                }, { quoted: msg });

                console.log(`[TTS] ✅ Sent voice note successfully`);

            } catch (ffmpegErr) {
                console.error(`[TTS] ❌ FFmpeg failed:`, ffmpegErr.message);
                // Fallback: send MP3 as regular audio
                await sendFallbackMp3(socket, sender, msg, mp3Buffer, channelContext, FOOTER);
            }

        } catch (e) {
            console.error(`[TTS] ❌ Error:`, e.message);
            await reply(`❌ TTS failed: ${e.message}${FOOTER}`);
        } finally {
            // Cleanup temp files
            await fs.remove(mp3Path).catch(() => {});
            await fs.remove(oggPath).catch(() => {});
        }
    }
};

// ==========================================
// 🔁 Fallback: Send MP3 as regular audio (not PTT)
// ==========================================
async function sendFallbackMp3(socket, sender, msg, mp3Buffer, channelContext, FOOTER) {
    try {
        console.log(`[TTS] 🔁 Fallback: sending MP3 as regular audio`);
        await socket.sendMessage(sender, {
            audio: mp3Buffer,
            mimetype: 'audio/mpeg',
            ptt: false,                  // ← Regular audio file, not voice note
            fileName: 'tts.mp3',
            contextInfo: channelContext
        }, { quoted: msg });
        console.log(`[TTS] ✅ Fallback sent`);
    } catch (e) {
        console.error(`[TTS] ❌ Fallback failed:`, e.message);
    }
}
