"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const catchServiceAsync_1 = require("../utils/catchServiceAsync");
const prisma = new client_1.PrismaClient();
class UserService {
}
exports.UserService = UserService;
_a = UserService;
UserService.getAllUsers = (0, catchServiceAsync_1.catchServiceAsync)(async () => {
    return prisma.user.findMany();
});
UserService.getUserById = (0, catchServiceAsync_1.catchServiceAsync)(async (id) => {
    return prisma.user.findUnique({ where: { id } });
});
UserService.createUser = (0, catchServiceAsync_1.catchServiceAsync)(async (data) => {
    return prisma.user.create({ data });
});
UserService.updateUser = (0, catchServiceAsync_1.catchServiceAsync)(async (id, data) => {
    return prisma.user.update({ where: { id }, data });
});
UserService.deleteUser = (0, catchServiceAsync_1.catchServiceAsync)(async (id) => {
    return prisma.user.delete({ where: { id } });
});
UserService.getCelebrations = (0, catchServiceAsync_1.catchServiceAsync)(async () => {
    const today = new Date();
    const profiles = await prisma.employeeProfile.findMany({
        include: { user: true }
    });
    const birthdays = profiles.filter(p => {
        if (!p.dateOfBirth)
            return false;
        const dob = new Date(p.dateOfBirth);
        return dob.getMonth() === today.getMonth();
    }).map(p => ({
        id: p.userId,
        name: p.user.name,
        email: p.user.email,
        profilePicture: p.profilePicture,
        dateOfBirth: p.dateOfBirth,
        designation: p.designation
    }));
    const newJoiners = profiles.filter(p => {
        if (!p.joiningDate)
            return false;
        const joining = new Date(p.joiningDate);
        const diffTime = today.getTime() - joining.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
    }).map(p => ({
        id: p.userId,
        name: p.user.name,
        email: p.user.email,
        profilePicture: p.profilePicture,
        joiningDate: p.joiningDate,
        designation: p.designation
    }));
    return { birthdays, newJoiners };
});
