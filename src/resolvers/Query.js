
function notes(parent, args, context) {
    return context.prisma.notes();
}

module.exports = {
    notes
};
