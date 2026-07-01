"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Protect all user routes
router.use(authMiddleware_1.verifyToken);
const allowedRoles = ['admin', 'cto', 'ceo', 'teamlead', 'founder'];
router.get('/', (0, authMiddleware_1.authorizeRoles)(...allowedRoles), userController_1.UserController.getAllUsers);
router.get('/events/celebrations', userController_1.UserController.getCelebrations);
router.get('/:id', userController_1.UserController.getUserById);
router.post('/', (0, authMiddleware_1.authorizeRoles)(...allowedRoles), userController_1.UserController.createUser);
router.put('/:id', (0, authMiddleware_1.authorizeRoles)(...allowedRoles), userController_1.UserController.updateUser);
router.delete('/:id', (0, authMiddleware_1.authorizeRoles)(...allowedRoles), userController_1.UserController.deleteUser);
exports.default = router;
