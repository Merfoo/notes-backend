
function createdBy(parent, args, context) {
    return context.prisma.note({ id: parent.id }).createdBy();
}

function title(parent, args, context){
    return parent.title;
}

module.exports = {
    createdBy,
    title
};
