/**
 * NIMORA MD - Notes
 * Category: owner
 * 
 * Save/retrieve notes.
 * BOT OWNER + MAIN OWNER can use.
 */

const { readJson, writeJson } = require('./_helper');

module.exports = {
    name: 'note',
    aliases: ['notes'],
    category: 'owner',
    description: 'Save/retrieve notes (owner only)',

    async execute(ctx) {
        const { args, reply, isOwner, isMainOwner, senderNumber, FOOTER } = ctx;

        // 🔒 Owner or Main Owner
        if (!isOwner && !isMainOwner) {
            return reply(`⚠️ *Owner Only!*${FOOTER}`);
        }

        const action = args[0]?.toLowerCase();
        const name = args[1]?.toLowerCase();
        const content = args.slice(2).join(' ');

        const notes = await readJson('notes.json', {});

        try {
            if (action === 'save' || action === 'add') {
                if (!name || !content) {
                    return reply(`⚠️ *Usage:* \`.note save [name] [content]\`${FOOTER}`);
                }
                notes[name] = content;
                await writeJson('notes.json', notes);
                await reply(`✅ Note saved: *${name}*${FOOTER}`);
                console.log(`[NOTE] Saved by ${senderNumber}: ${name}`);

            } else if (action === 'get' || action === 'show') {
                if (!name) return reply(`⚠️ *Usage:* \`.note get [name]\`${FOOTER}`);
                if (!notes[name]) return reply(`❌ Note not found: *${name}*${FOOTER}`);
                await reply(`📝 *${name.toUpperCase()}*

${notes[name]}${FOOTER}`);

            } else if (action === 'list') {
                const list = Object.keys(notes);
                if (list.length === 0) return reply(`📝 No notes saved!${FOOTER}`);
                await reply(`📝 *NOTES* (${list.length})

${list.map((n, i) => `${i + 1}. ${n}`).join('\n')}${FOOTER}`);

            } else if (action === 'del' || action === 'delete') {
                if (!name) return reply(`⚠️ *Usage:* \`.note del [name]\`${FOOTER}`);
                if (!notes[name]) return reply(`❌ Note not found!${FOOTER}`);
                delete notes[name];
                await writeJson('notes.json', notes);
                await reply(`✅ Deleted: *${name}*${FOOTER}`);

            } else {
                await reply(`📝 *NOTE COMMANDS*

• \`.note save [name] [content]\`
• \`.note get [name]\`
• \`.note list\`
• \`.note del [name]\`${FOOTER}`);
            }
        } catch (e) {
            console.error('[NOTE] Error:', e.message);
            await reply(`❌ Failed: ${e.message}${FOOTER}`);
        }
    }
};
