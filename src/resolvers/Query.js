
async function getNotes(parent, { username, filter, skip, first, orderBy }, context) {
    let where = {};

    if (username)
        where["createdBy"] = { username };

    if (filter) {
        where["OR"] = [
            { title_contains: filter },
            { body_contains: filter }
        ];
    }

    const notes = await context.prisma.notes({
        where,
        skip,
        first,
        orderBy
    });

    const count = await context.prisma
        .notesConnection({
            where
        })
        .aggregate()
        .count();

    return {
        notes,
        count
    };
}

async function getNote(parent, { titleId }, context) {
    const note = await context.prisma.note({
        titleId
    });

    return note;
}

async function getUser(parent, { username }, context) {
    return await context.prisma.user({ username });
}

module.exports = {
    getNotes,
    getNote,
    getUser
};
