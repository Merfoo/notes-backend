const { getUserId } = require("../utils");

async function getPublicNotes(parent, { username, filter, skip, first, orderBy }, context) {
    let where = { isPrivate: false };

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

    if (!note)
        return null;

    let res = null;

    if (note.isPrivate) {
        const userId = getUserId(context);

        if (userId) {
            const createdBy = await context.prisma.note({ titleId }).createdBy();

            if (userId === createdBy.id)
                res = note;
        }
    }

    else
        res = note;

    return res;
}

async function getUser(parent, { username }, context) {
    const user = await context.prisma.user({ username });
    
    if (!user)
        return null;

    let res = {
        createdAt: user.createdAt,
        username: user.username,
        email: "",
        notes: []
    }
    
    const userId = getUserId(context);

    if (userId && userId === user.id) {
        res.email = user.email;
        res.notes = await context.prisma.user({ username }).notes();
    }

    else
        res.notes = await context.prisma.user({ username }).notes({ where: { isPrivate: false } });

    return res;
}

module.exports = {
    getPublicNotes,
    getNote,
    getUser
};
