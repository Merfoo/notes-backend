const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils");

async function signup(parent, { email, username, password }, context) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await context.prisma.createUser({
        email,
        username,
        password: hashedPassword
    });

    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    return {
        token,
        user
    };
}

async function login(parent, { email, password }, context) {
    const user = await context.prisma.user({ email });

    if (!user)
        throw new Error("Invalid user! Change this message");

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword)
        throw new Error("Invalid password! Change this message");

    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    return {
        token,
        user
    };
}

async function createNote(parent, { titleId, title, body }, context){
    const userId = getUserId(context);

    const note = await context.prisma.createNote({
        createdBy: { connect: { id: userId } },
        titleId,
        title,
        body
    });

    return note;
}

module.exports = {
    signup,
    login,
    createNote
};
