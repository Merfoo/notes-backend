async function user(parent, args, context) {
    return await context.prisma.passwordReset({ id: parent.id }).user();
}

module.exports = {
    user
};
