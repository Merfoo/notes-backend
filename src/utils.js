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

function createURL(text) {
    let url = text.toLowerCase();
    url = url.replace(/ /g, "-");
    url = url.replace(/[^a-zA-Z0-9_-]/g, "");

    return url;
}

module.exports = {
    getUserId,
    createURL,
    APP_SECRET
};
