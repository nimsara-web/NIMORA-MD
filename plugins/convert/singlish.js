/**
 * NIMORA MD - Singlish → Sinhala Transliterate
 * Category: convert
 * 
 * Usage:
 *   .singlish ayubowan      → අයුබෝවන්
 *   .singlish kohomada      → කොහොමද
 *   Reply + .singlish       → Translate replied Singlish
 * 
 * Aliases: .singlish, .singu, .sls, .transliterate
 */

module.exports = {
    name: 'singlish',
    aliases: ['singu', 'sls', 'transliterate', 'singlish2sinhala'],
    category: 'convert',
    description: 'Singlish → Sinhala transliterate',

    async execute(ctx) {
        const { args, reply, msg, unwrapMessage, FOOTER } = ctx;

        // ==========================================
        // 1️⃣ Get text
        // ==========================================
        let text = '';

        // Check replied message first
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (quoted?.quotedMessage) {
            const qMsg = unwrapMessage(quoted.quotedMessage);
            if (qMsg) {
                text = qMsg.conversation ||
                       qMsg.extendedTextMessage?.text ||
                       qMsg.imageMessage?.caption ||
                       qMsg.videoMessage?.caption ||
                       '';
            }
        }

        // If no quoted, use args
        if (!text) {
            text = args.join(' ').trim();
        }

        if (!text) {
            return reply(`✍️ *SINGLISH → SINHALA*

📌 *Usage:*
• \`.singlish [singlish text]\`
• Reply + \`.singlish\`

*Examples:*
• \`.singlish ayubowan\` → අයුබෝවන්
• \`.singlish kohomada\` → කොහොමද
• \`.singlish mama gihilla ennam\` → මම ගිහිල්ලා එන්නම්

💡 _Translates Singlish (romanized Sinhala) to Sinhala script_${FOOTER}`);
        }

        try {
            const result = transliterate(text);

            if (!result || result === text) {
                return reply(`⚠️ *Could not transliterate!*

📝 *Input:* ${text}
💡 Try simpler words or check spelling${FOOTER}`);
            }

            await reply(`✍️ *SINGLISH → SINHALA*

📥 *Input:* ${text}
📤 *Output:* ${result}

━━━━━━━━━━━━━━━━${FOOTER}`);

            console.log(`[SINGLISH] ✅ "${text}" → "${result}"`);

        } catch (e) {
            console.error('[SINGLISH] Error:', e.message);
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};

// ==========================================
// 🔤 Singlish → Sinhala Transliteration Engine
// ==========================================
function transliterate(text) {
    if (!text) return text;

    let result = text.toLowerCase();

    // ==========================================
    // 📚 Mapping table (longest first for correct matching)
    // ==========================================
    const vowelMap = {
        'aee': 'ඇ', 'aa': 'ආ', 'ae': 'ඇ', 'ai': 'ඓ', 'au': 'ඖ',
        'ee': 'ඒ', 'ea': 'ඒ', 'ii': 'ඊ', 'ie': 'ඊ', 'oo': 'ඕ', 'oa': 'ඕ',
        'uu': 'ඌ', 'ou': 'ඖ',
        'a': 'අ', 'e': 'එ', 'i': 'ඉ', 'o': 'ඔ', 'u': 'උ'
    };

    const vowelSignMap = {
        'aee': 'ැ', 'aa': 'ා', 'ae': 'ැ', 'ai': 'ෛ', 'au': 'ෞ',
        'ee': 'ේ', 'ea': 'ේ', 'ii': 'ී', 'ie': 'ී', 'oo': 'ෝ', 'oa': 'ෝ',
        'uu': 'ූ', 'ou': 'ෞ',
        'a': '', 'e': 'ෙ', 'i': 'ි', 'o': 'ො', 'u': 'ු'
    };

    const consonantMap = {
        // Special combos
        'ksh': 'ක්ෂ', 'gny': 'ඥ',
        // Regular consonants
        'kh': 'ඛ', 'gh': 'ඝ', 'ch': 'ඡ', 'jh': 'ඣ', 'th': 'ත', 'dh': 'ධ',
        'ph': 'ඵ', 'bh': 'භ', 'sh': 'ශ', 'ss': 'ෂ', 'ng': 'ං',
        'k': 'ක', 'g': 'ග', 'j': 'ජ', 't': 'ට', 'd': 'ඩ', 'n': 'න',
        'p': 'ප', 'b': 'බ', 'm': 'ම', 'y': 'ය', 'r': 'ර', 'l': 'ල',
        'v': 'ව', 'w': 'ව', 's': 'ස', 'h': 'හ', 'f': 'ෆ', 'z': 'ශ',
        'c': 'ච', 'q': 'ක'
    };

    const specialMap = {
        'lla': 'ළ', 'lha': 'ළ', 'nng': 'ඟ', 'nnd': 'ඬ', 'mm': 'ම්ම',
        'thth': 'ත්ත', 'kk': 'ක්ක', 'tt': 'ට්ට', 'pp': 'ප්ප',
        'ru': 'රු', 'ruu': 'රූ',
        'kr': 'ක්ර', 'pr': 'ප්ර', 'br': 'බ්ර', 'tr': 'ට්ර', 'dr': 'ඩ්ර',
        'sr': 'ස්ර', 'gr': 'ග්ර', 'kr': 'ක්ර'
    };

    // ==========================================
    // 🔧 Apply special replacements first
    // ==========================================
    Object.keys(specialMap).sort((a, b) => b.length - a.length).forEach(key => {
        result = result.replace(new RegExp(key, 'g'), specialMap[key]);
    });

    // ==========================================
    // 🔧 Process character by character
    // ==========================================
    let output = '';
    let i = 0;
    const len = result.length;

    while (i < len) {
        let matched = false;

        // Try to match 3-char, 2-char, then 1-char
        for (let size = 3; size >= 1; size--) {
            const chunk = result.substring(i, i + size);
            if (!chunk) continue;

            // Skip if already Sinhala
            if (/[\u0D80-\u0DFF]/.test(chunk)) {
                output += chunk;
                i += size;
                matched = true;
                break;
            }

            // Check consonants
            if (consonantMap[chunk]) {
                output += consonantMap[chunk];

                // Look for following vowel
                const remaining = result.substring(i + size);
                let vowelMatched = false;

                for (let vsize = 3; vsize >= 1; vsize--) {
                    const vowelChunk = remaining.substring(0, vsize);
                    if (vowelSignMap[vowelChunk] !== undefined) {
                        output += vowelSignMap[vowelChunk];
                        i += size + vsize;
                        vowelMatched = true;
                        break;
                    }
                }

                if (!vowelMatched) {
                    // No vowel → add hal kirima (්)
                    // But only if next char is not space/punctuation
                    const nextChar = result[i + size];
                    if (nextChar && /[a-z]/.test(nextChar)) {
                        output += '්';
                    }
                    i += size;
                }

                matched = true;
                break;
            }

            // Check standalone vowels
            if (vowelMap[chunk] && size > 0) {
                // Only use vowel form if at start of word or after space
                const prevChar = output.slice(-1);
                const prevRaw = i > 0 ? result[i - 1] : ' ';

                if (!prevRaw || prevRaw === ' ' || !/[a-z]/.test(prevRaw)) {
                    output += vowelMap[chunk];
                } else {
                    output += vowelSignMap[chunk] || '';
                }
                i += size;
                matched = true;
                break;
            }

            // Keep spaces, punctuation, numbers
            if (/[\s\d\.,!?;:'"()\-]/.test(chunk)) {
                output += chunk;
                i += size;
                matched = true;
                break;
            }
        }

        if (!matched) {
            // Unmatched character → keep as-is
            output += result[i];
            i++;
        }
    }

    // ==========================================
    // 🧹 Cleanup
    // ==========================================
    output = output
        .replace(/්්/g, '්')          // Double hal kirima
        .replace(/්(?=[\s\d.,!?])/g, '') // Remove hal before punctuation
        .replace(/\s+/g, ' ')
        .trim();

    return output;
}

// Export for testing
module.exports.transliterate = transliterate;
