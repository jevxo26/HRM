import { PrismaClient, Prisma } from '@prisma/client';
import { catchServiceAsync } from '../utils/catchServiceAsync';

const prisma = new PrismaClient();

export class UserService {
  static getAllUsers = catchServiceAsync(async () => {
    return prisma.user.findMany();
  });

  static getUserById = catchServiceAsync(async (id: number) => {
    return prisma.user.findUnique({ where: { id } });
  });

  static createUser = catchServiceAsync(async (data: Prisma.UserCreateInput) => {
    const dataToSave = { ...data };
    if (data.password) {
      const bcrypt = require('bcrypt');
      dataToSave.password = await bcrypt.hash(data.password, 10);
    }
    return prisma.user.create({ data: dataToSave });
  });

  static updateUser = catchServiceAsync(async (id: number, data: Prisma.UserUpdateInput) => {
    const dataToSave = { ...data };
    if (typeof data.password === 'string' && data.password) {
      const bcrypt = require('bcrypt');
      dataToSave.password = await bcrypt.hash(data.password, 10);
    }
    return prisma.user.update({ where: { id }, data: dataToSave });
  });

  static deleteUser = catchServiceAsync(async (id: number) => {
    return prisma.user.delete({ where: { id } });
  });

  static getCelebrations = catchServiceAsync(async () => {
    const today = new Date();
    const profiles = await prisma.employeeProfile.findMany({
      include: { user: true }
    });
    
    const birthdays = profiles.filter(p => {
      if (!p.dateOfBirth) return false;
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
      if (!p.joiningDate) return false;
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
}
