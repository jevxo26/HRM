"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Configure storage for multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Save files in the public/uploads directory so they can be statically served
        cb(null, path_1.default.join(process.cwd(), 'public', 'uploads'));
    },
    filename: (req, file, cb) => {
        // Generate a unique filename: timestamp + random number + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});
// Create the multer instance
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image and pdf files as an example
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});
