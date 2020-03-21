const jwt = require("jsonwebtoken");
const APP_SECRET = process.env.JWT_APP_SECRET;

function getUserId(context) {
    const authorization = context.request.get("Authorization");

    if (authorization) {
        const token = authorization.replace("Bearer ", "");
        const { userId } = jwt.verify(token, APP_SECRET);

        return userId;
    }

    return null;
}

// Slugify text, convert text to URL friendly text
function slugify(text) {
    let slug = text.toLowerCase();
    slug = slug.replace(/ /g, "-");
    slug = slug.replace(/[^a-zA-Z0-9_-]/g, "");

    return slug;
}

module.exports = {
    getUserId,
    slugify,
    APP_SECRET
};
