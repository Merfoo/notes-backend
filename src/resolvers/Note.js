
async function createdBy(parent, args, context) {
    return await context.prisma.note({ id: parent.id }).createdBy();
}

module.exports = {
    createdBy
};
