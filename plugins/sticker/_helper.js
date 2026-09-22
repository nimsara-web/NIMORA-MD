const sharp = require('sharp');
const { downloadMediaMessage } = require('baileys');
const pino = require('pino');

async function convertToSticker(buffer, isVideo = false) {
    try {
        if (!sharp) return buffer;

        const meta = await sharp(buffer, { animated: !!isVideo }).metadata();
        console.log(`[STICKER] ${meta.width}x${meta.height} ${meta.format} animated:${!!isVideo}`);

        if (isVideo) {
            // Try animated
            try {
                const result = await sharp(buffer, {
                    animated: true,
                    limitInputPixels: false,
                    pages: -1
                })
                    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                    .webp({ quality: 55, effort: 4, loop: 0, delay: 100, lossless: false })
                    .toBuffer();

                if (result && result.length > 100 &&
                    result[0] === 0x52 && result[1] === 0x49 &&
                    result[2] === 0x46 && result[3] === 0x46) {
                    return result;
                }
            } catch (e) {
                console.log('[STICKER] Animated failed:', e.message);
            }

            // Static fallback
            try {
                return await sharp(buffer, { animated: false, page: 0, limitInputPixels: false })
                    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                    .ensureAlpha()
                    .webp({ quality: 75, effort: 4 })
                    .toBuffer();
            } catch (e) {
                return buffer;
            }
        } else {
            return await sharp(buffer, { limitInputPixels: false, failOnError: false })
                .rotate()
                .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .ensureAlpha()
                .webp({ quality: 80, effort: 4 })
                .toBuffer();
        }
    } catch (e) {
        console.error('[STICKER] Convert error:', e.message);
        return buffer;
    }
}

async function getQuotedMedia(ctx) {
    const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo;
    if (!quoted?.quotedMessage) return null;

    const qMsg = ctx.unwrapMessage(quoted.quotedMessage);
    const mediaInfo = ctx.getMediaType(qMsg);
    if (!mediaInfo) return null;

    const { type, data } = mediaInfo;
    const buffer = await downloadMediaMessage(
        { key: { remoteJid: quoted.remoteJid || ctx.sender, id: quoted.stanzaId, participant: quoted.participant }, message: { [type]: data } },
        'buffer', {}, { logger: pino({ level: 'silent' }) }
    );
    return { buffer, type, data, quoted };
}

module.exports = { convertToSticker, getQuotedMedia };
