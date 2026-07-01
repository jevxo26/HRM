"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTemplateEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.FROM_NAME || 'My App'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Error sending email: ', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
const sendTemplateEmail = async (to, subject, templateName, context) => {
    try {
        const templatePath = path_1.default.join(process.cwd(), 'server', 'templates', 'emails', `${templateName}.hbs`);
        const templateSource = fs_1.default.readFileSync(templatePath, 'utf8');
        const compiledTemplate = handlebars_1.default.compile(templateSource);
        const htmlContent = compiledTemplate(context);
        // Provide a basic text fallback
        const textFallback = `Please open this email in a client that supports HTML.`;
        return await (0, exports.sendEmail)(to, subject, textFallback, htmlContent);
    }
    catch (error) {
        console.error(`Error sending template email (${templateName}): `, error);
        throw error;
    }
};
exports.sendTemplateEmail = sendTemplateEmail;
