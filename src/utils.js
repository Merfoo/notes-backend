const jwt = require("jsonwebtoken");
const APP_SECRET = "some secret secret :)"

function getUserId(context) {
    const authorization = context.require.get("Authorization");

    if (authorization) {
        const token = authorization.replace("Bearer ", "");
        const { userId } = jwt.verify(token, APP_SECRET);

        return userId;
    }

    throw new Error("Not authenticated");
}

module.exports = {
    getUserId,
    APP_SECRET
};
