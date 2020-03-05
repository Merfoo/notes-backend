
async function notes(parent, { filter, skip, first, orderBy }, context) {
    const where = filter ? {
        OR: [
            { title_contains: filter },
            { body_contains: filter }
        ]
    } : {};

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
    notes
};
