const { readJson, writeJson } = require('./_helper');

module.exports = {
    name: 'note',
    aliases: ['notes'],
    category: 'owner',
    description: 'Save/retrieve notes',

    async execute(ctx) {
        const { args, reply, isOwner, FOOTER } = ctx;
        if (!isOwner) return reply(`⚠️ Only Bot Owner!${FOOTER}`);

        const action = args[0]?.toLowerCase();
        const name = args[1]?.toLowerCase();
        const content = args.slice(2).join(' ');

        const notes = await readJson('notes.json', {});

        if (action === 'save' || action === 'add') {
            if (!name || !content) return reply(`⚠️ Usage: .note save [name] [content]${FOOTER}`);
            notes[name] = content;
            await writeJson('notes.json', notes);
            await reply(`✅ Note saved: *${name}*${FOOTER}`);
        } else if (action === 'get' || action === 'show') {
            if (!name) return reply(`⚠️ Usage: .note get [name]${FOOTER}`);
            if (!notes[name]) return reply(`❌ Note not found!${FOOTER}`);
            await reply(`📝 *${name.toUpperCase()}*\n\n${notes[name]}${FOOTER}`);
        } else if (action === 'list') {
            const list = Object.keys(notes);
            if (list.length === 0) return reply(`📝 No notes!${FOOTER}`);
            await reply(`📝 *NOTES*\n\n${list.map((n, i) => `${i + 1}. ${n}`).join('\n')}${FOOTER}`);
        } else if (action === 'del' || action === 'delete') {
            if (!name) return reply(`⚠️ Usage: .note del [name]${FOOTER}`);
            delete notes[name];
            await writeJson('notes.json', notes);
            await reply(`✅ Deleted: *${name}*${FOOTER}`);
        } else {
            await reply(`📝 *Note Commands*

.note save [name] [content]
.note get [name]
.note list
.note del [name]${FOOTER}`);
        }
    }
};
