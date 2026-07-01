"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const twilio_1 = __importDefault(require("twilio"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = (0, twilio_1.default)(accountSid, authToken);
const sendSMS = async (to, body) => {
    try {
        const message = await client.messages.create({
            body,
            from: twilioPhoneNumber,
            to,
        });
        console.log('SMS sent: %s', message.sid);
        return message;
    }
    catch (error) {
        console.error('Error sending SMS: ', error);
        throw error;
    }
};
exports.sendSMS = sendSMS;
