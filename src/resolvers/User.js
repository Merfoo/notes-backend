
function notes(parent, args, context) {
    return context.prisma.user({ id: parent.id }).notes();
}

module.exports = {
    notes
};
