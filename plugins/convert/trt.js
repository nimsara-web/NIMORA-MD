/**
 * NIMORA MD - Translate (TRT)
 * Category: convert
 * 
 * Usage:
 *   .trt [lang] [text]         → Translate text
 *   Reply + .trt [lang]        → Translate replied message
 * 
 * Examples:
 *   .trt si Hello world        → සිංහලට
 *   .trt en මම හොඳින්       → English
 *   .trt ta Good morning       → Tamil
 */

const axios = require('axios');

// ==========================================
// 🌍 Language Code Map
// ==========================================
const LANG_NAMES = {
    'si': 'සිංහල (Sinhala)',
    'en': 'English',
    'ta': 'தமிழ் (Tamil)',
    'hi': 'हिन्दी (Hindi)',
    'ar': 'العربية (Arabic)',
    'fr': 'Français (French)',
    'de': 'Deutsch (German)',
    'es': 'Español (Spanish)',
    'it': 'Italiano (Italian)',
    'pt': 'Português (Portuguese)',
    'ru': 'Русский (Russian)',
    'ja': '日本語 (Japanese)',
    'ko': '한국어 (Korean)',
    'zh': '中文 (Chinese)',
    'th': 'ไทย (Thai)',
    'vi': 'Tiếng Việt (Vietnamese)',
    'id': 'Bahasa Indonesia',
    'ms': 'Bahasa Melayu',
    'bn': 'বাংলা (Bengali)',
    'ur': 'اردو (Urdu)',
    'ne': 'नेपाली (Nepali)',
    'nl': 'Nederlands (Dutch)',
    'tr': 'Türkçe (Turkish)',
    'pl': 'Polski (Polish)',
    'sv': 'Svenska (Swedish)',
    'el': 'Ελληνικά (Greek)',
    'he': 'עברית (Hebrew)',
    'fa': 'فارسی (Persian)',
    'sw': 'Kiswahili (Swahili)'
};

module.exports = {
    name: 'trt',
    aliases: ['translate', 'tr'],
    category: 'convert',
    description: 'Translate text to any language',

    async execute(ctx) {
        const { args, reply, msg, unwrapMessage, FOOTER } = ctx;

        // ==========================================
        // 1️⃣ Get target language
        // ==========================================
        const targetLang = args[0]?.toLowerCase();

        if (!targetLang) {
            return reply(`🌐 *TRANSLATE COMMAND*

📌 *Usage:*
• \`.trt [lang] [text]\` - Translate text
• Reply + \`.trt [lang]\` - Translate reply

*Examples:*
• \`.trt si Hello world\` → සිංහල
• \`.trt en මම හොඳින්\` → English
• \`.trt ta Good morning\` → Tamil
• \`.trt hi Hello\` → Hindi

*Popular Languages:*
• \`si\` - සිංහල
• \`en\` - English
• \`ta\` - Tamil
• \`hi\` - Hindi
• \`ar\` - Arabic
• \`fr\` - French
• \`de\` - German
• \`es\` - Spanish
• \`ja\` - Japanese
• \`ko\` - Korean
• \`zh\` - Chinese
• \`ru\` - Russian

💡 Google Translate (auto-detect source)${FOOTER}`);
        }

        // ==========================================
        // 2️⃣ Get text to translate
        // ==========================================
        let textToTranslate = '';

        // Check replied message
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (quoted?.quotedMessage) {
            const qMsg = unwrapMessage(quoted.quotedMessage);
            if (qMsg) {
                textToTranslate = qMsg.conversation ||
                                  qMsg.extendedTextMessage?.text ||
                                  qMsg.imageMessage?.caption ||
                                  qMsg.videoMessage?.caption ||
                                  '';
            }
        }

        // If no quoted message, use args (after language)
        if (!textToTranslate) {
            textToTranslate = args.slice(1).join(' ').trim();
        }

        if (!textToTranslate) {
            return reply(`⚠️ *No text to translate!*

📌 *Usage:*
• \`.trt ${targetLang} [text]\`
• හෝ reply කරලා \`.trt ${targetLang}\`${FOOTER}`);
        }

        if (textToTranslate.length > 1500) {
            textToTranslate = textToTranslate.substring(0, 1500);
        }

        // ==========================================
        // 3️⃣ Translate
        // ==========================================
        try {
            const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;

            const res = await axios.get(apiUrl, { timeout: 15000 });
            const data = res.data;

            if (!data || !data[0]) {
                return reply(`❌ *Translation failed!* (invalid response)${FOOTER}`);
            }

            const translatedText = data[0].map(item => item[0]).filter(Boolean).join('');
            const detectedLang = data[2] || 'auto';

            if (!translatedText) {
                return reply(`❌ *Translation failed!* (empty)${FOOTER}`);
            }

            const langName = LANG_NAMES[targetLang] || targetLang.toUpperCase();

            await reply(`🌐 *TRANSLATION*

📥 *From:* ${detectedLang.toUpperCase()}
📤 *To:* ${langName}

━━━━━━━━━━━━━━━━
${translatedText}
━━━━━━━━━━━━━━━━

💡 _Powered by Google Translate_${FOOTER}`);

            console.log(`[TRT] ✅ ${detectedLang} → ${targetLang}`);

        } catch (e) {
            console.error('[TRT] Error:', e.message);
            await reply(`❌ *Translation failed!*

📝 *Error:* ${e.message}

💡 Check language code and try again.${FOOTER}`);
        }
    }
};
