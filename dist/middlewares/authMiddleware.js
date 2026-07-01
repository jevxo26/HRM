"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }
    const token = authHeader.split(' ')[1]; // Expected format: "Bearer <token>"
    if (!token) {
        res.status(401).json({ error: 'Access denied. Invalid token format.' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Invalid token.' });
    }
};
exports.verifyToken = verifyToken;
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ error: 'Access denied. Requires admin role.' });
    }
};
exports.isAdmin = isAdmin;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (req.user && allowedRoles.includes(req.user.role)) {
            next();
        }
        else {
            res.status(403).json({ error: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
        }
    };
};
exports.authorizeRoles = authorizeRoles;
