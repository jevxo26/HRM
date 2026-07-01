"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const next_1 = __importDefault(require("next"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const leaveRoutes_1 = __importDefault(require("./routes/leaveRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const prisma = new client_1.PrismaClient();
const dev = process.env.NODE_ENV !== 'production';
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 8080;
app.prepare().then(async () => {
    const server = (0, express_1.default)();
    // Middleware
    server.use((0, cors_1.default)());
    server.use((0, helmet_1.default)({ contentSecurityPolicy: false })); // Disable CSP in dev if needed, or configure properly
    server.use((0, morgan_1.default)('[:date[iso]] :method :url :status :response-time ms - :res[content-length]', {
        skip: (req) => req.url.startsWith('/_next/') || req.url.includes('favicon.ico')
    }));
    server.use(express_1.default.json());
    server.use((0, cookie_parser_1.default)());
    // Database Connection using Prisma
    try {
        await prisma.$connect();
        console.log('Prisma connected to the database successfully!');
    }
    catch (err) {
        console.error('Error connecting to the database with Prisma:', err);
    }
    // API Routes
    server.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date() });
    });
    server.use('/api/users', userRoutes_1.default);
    server.use('/api/auth', authRoutes_1.default);
    server.use('/api/upload', uploadRoutes_1.default);
    server.use('/api/attendance', attendanceRoutes_1.default);
    server.use('/api/schedule', scheduleRoutes_1.default);
    server.use('/api/projects', projectRoutes_1.default);
    server.use('/api/tasks', taskRoutes_1.default);
    server.use('/api/teams', teamRoutes_1.default);
    server.use('/api/leaves', leaveRoutes_1.default);
    server.use('/api/profile', profileRoutes_1.default);
    // Serve uploaded files statically
    server.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'public', 'uploads')));
    // Let Next.js handle all other routes
    server.use((req, res) => {
        return handle(req, res);
    });
    // Global Error Handler
    server.use((err, req, res, next) => {
        console.error(err);
        let statusCode = err.statusCode || 500;
        if (err.message === 'User already exists with this email')
            statusCode = 409;
        if (err.message === 'Invalid email or password')
            statusCode = 401;
        if (err.message === 'Unauthorized')
            statusCode = 401;
        const message = err.message || 'Internal Server Error';
        res.status(statusCode).json({
            success: false,
            message: message,
            data: null
        });
    });
    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
}).catch((err) => {
    console.error('Error starting server', err);
    process.exit(1);
});
