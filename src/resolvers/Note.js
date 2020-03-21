const { slugify } = require("../utils");

async function createdBy(parent, args, context) {
    return await context.prisma.note({ id: parent.id }).createdBy();
}

function slug(parent, args, context) {
    return `${slugify(parent.title)}-${parent.slugId}`;
}

module.exports = {
    createdBy,
    slug
};
