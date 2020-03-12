const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const nanoid = require("nanoid");
const { generateCombination } = require("gfycat-style-urls");
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
        throw new Error("Invalid credentials");

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword)
        throw new Error("Invalid credentials");

    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    return {
        token,
        user
    };
}

async function emailPasswordReset(parent, { email }, context) {
    const user = await context.prisma.user({ email });

    if (user) {
        // Create PasswordReset fields
        const expireMinutes = 5;
        const resetId = nanoid();
        
        let expireDate = new Date();
        expireDate.setMinutes(expireDate.getMinutes() + expireMinutes);
        
        // Create PasswordReset entry
        await context.prisma.createPasswordReset({
            resetId,
            user: { connect: { id: user.id } },
            expireDate: expireDate.toISOString()
        });
        
        // Create transporter for sending email
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                user: process.env.GMAIL_USER,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                accessToken: process.env.GMAIL_ACCESS_TOKEN
            }
        });

        // Create password reset link
        const baseUrl = process.env.BASE_URL;
        const passwordResetLink = `${baseUrl}/account/reset_password/${resetId}`;
        
        // Create email
        const mailOptions = {
            to: user.email,
            subject: "Notes Account Password Reset",
            html: `Hello ${user.username},<br><br>You have requested a password reset <a href="${passwordResetLink}">link</a>.<br>This link expires in ${expireMinutes} minutes.`
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error)
                console.log("Send email error", error);
        });

        // Delete PasswordReset entry after it expires
        setTimeout(async () => {
            // Entry could have been deleted already
            try {
                await context.prisma.deletePasswordReset({ resetId });
            }

            catch (e) {}
        }, expireMinutes * 60 * 1000);
    }

    return email;
}

async function resetPassword(parent, { resetId, password }, context) {
    let res = null;

    const passwordReset = await context.prisma.passwordReset({ resetId });

    if (passwordReset) {
        const nowDate = new Date();
        const expireDate = new Date(passwordReset.expireDate);

        const passwordResetUser = await context.prisma.passwordReset({ resetId }).user();

        if (nowDate <= expireDate) {
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await context.prisma.updateUser({ 
                data: { password: hashedPassword },
                where: { id: passwordResetUser.id }
            });

            const token = jwt.sign({ userId: user.id }, APP_SECRET);

            res = { token, user };
        }

        // Entry could have been deleted already
        try {
            await context.prisma.deletePasswordReset({ resetId });
        }

        catch (e) {}
    }

    return res;
}

async function createNote(parent, { title, body, isPrivate }, context) {
    const userId = getUserId(context);

    if (!userId)
        throw new Error("Not authenticated");

    const titleId = `${title.replace(/ /g, "-")}-${generateCombination(2, "")}`.toLowerCase();

    const note = await context.prisma.createNote({
        createdBy: { connect: { id: userId } },
        titleId,
        title,
        body,
        isPrivate
    });

    return note;
}

async function updateNote(parent, { titleId, body, isPrivate }, context) {
    const userId = getUserId(context);

    if (!userId)
        throw new Error("Not authenticated");

    const { id: noteUserId } = await context.prisma.note({ titleId }).createdBy();

    if (userId !== noteUserId)
        throw new Error("Unauthorized user");

    const note = await context.prisma.updateNote({
        data: { body, isPrivate },
        where: { titleId }
    });

    return note;
}

async function deleteNote(parent, { titleId }, context) {
    const userId = getUserId(context);

    if (!userId)
        throw new Error("Not authenticated");

    const { id: noteUserId } = await context.prisma.note({ titleId }).createdBy();

    if (userId !== noteUserId)
        throw new Error("Unauthorized user");

    return await context.prisma.deleteNote({ titleId });
}

module.exports = {
    signup,
    login,
    emailPasswordReset,
    resetPassword,
    createNote,
    updateNote,
    deleteNote
};
