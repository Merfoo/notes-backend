
async function notes(parent, args, context) {
    return await context.prisma.user({ id: parent.id }).notes();
}

async function passwordResets(parent, args, context) {
    return await context.prisma.user({ id: parent.id }).passwordResets();
}

module.exports = {
    notes,
    passwordResets
};
