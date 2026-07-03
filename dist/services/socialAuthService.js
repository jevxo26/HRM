"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAuthService = void 0;
const client_1 = require("@prisma/client");
const google_auth_library_1 = require("google-auth-library");
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchServiceAsync_1 = require("../utils/catchServiceAsync");
const prisma = new client_1.PrismaClient();
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
class SocialAuthService {
    static async findOrCreateUser(params) {
        const { email, name, provider, providerId } = params;
        let user = await prisma.user.findUnique({
            where: { email },
        });
        if (user) {
            // Update provider if they are logging in via social for the first time
            // with an existing email, or just return the user.
            if (user.provider !== provider) {
                user = await prisma.user.update({
                    where: { email },
                    data: { provider, providerId },
                });
            }
        }
        else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    provider,
                    providerId,
                    role: 'employee',
                },
            });
        }
        // Generate our app's JWT
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, secret, { expiresIn: expiresIn });
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        return {
            token,
            user: userWithoutPassword,
        };
    }
}
exports.SocialAuthService = SocialAuthService;
_a = SocialAuthService;
SocialAuthService.loginWithGoogle = (0, catchServiceAsync_1.catchServiceAsync)(async (credential) => {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new Error('Invalid Google token payload');
    }
    const { email, name, sub: googleId } = payload;
    return await _a.findOrCreateUser({
        email,
        name: name || 'Google User',
        provider: 'google',
        providerId: googleId,
    });
});
SocialAuthService.loginWithFacebook = (0, catchServiceAsync_1.catchServiceAsync)(async (accessToken) => {
    // Verify the Facebook access token and get user info
    const { data } = await axios_1.default.get(`https://graph.facebook.com/me`, {
        params: {
            fields: 'id,name,email',
            access_token: accessToken,
        },
    });
    if (!data || !data.email) {
        throw new Error('Invalid Facebook token payload or email not provided');
    }
    const { email, name, id: facebookId } = data;
    return await _a.findOrCreateUser({
        email,
        name: name || 'Facebook User',
        provider: 'facebook',
        providerId: facebookId,
    });
});
