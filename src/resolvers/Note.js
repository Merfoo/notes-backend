
function createdBy(parent, args, context) {
    return context.prisma.note({ id: parent.id }).createdBy();
}

module.exports = {
    createdBy
};
