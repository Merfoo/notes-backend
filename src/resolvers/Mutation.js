const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils");
const { generateCombination } = require("gfycat-style-urls");

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

async function createNote(parent, { title, body }, context){
    const userId = getUserId(context);
    const titleId = `${title}-${generateCombination(2, "").toLowerCase()}`;

    const note = await context.prisma.createNote({
        createdBy: { connect: { id: userId } },
        titleId,
        title,
        body
    });

    return note;
}

async function updateNote(parent, { titleId, body }, context){
    const userId = getUserId(context);
    const { id: noteUserId } = await context.prisma.note({ titleId }).createdBy();

    if (userId !== noteUserId)
        throw new Error("Invalid user! Change this message");

    const note = await context.prisma.updateNote({
        data: { body },
        where: { titleId }
    });

    return note;
}

async function deleteNote(parent, { titleId }, context){
    const userId = getUserId(context);
    const { id: noteUserId } = await context.prisma.note({ titleId }).createdBy();

    if (userId !== noteUserId)
        throw new Error("Invalid user! Change this message");

    const note = await context.prisma.deleteNote({
        titleId
    });

    return titleId;
}

module.exports = {
    signup,
    login,
    createNote,
    updateNote,
    deleteNote
};
