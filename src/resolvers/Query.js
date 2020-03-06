
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

module.exports = {
    getNotes
};
