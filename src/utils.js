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

module.exports = {
    getUserId,
    APP_SECRET
};
