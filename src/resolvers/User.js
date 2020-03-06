
async function notes(parent, args, context) {
    return await context.prisma.user({ id: parent.id }).notes();
}

module.exports = {
    notes
};
