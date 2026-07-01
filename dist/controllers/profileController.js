"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfileById = exports.getMyProfile = void 0;
const profileService = __importStar(require("../services/profileService"));
const getMyProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const profile = await profileService.getProfileByUserId(userId);
        res.status(200).json({ data: profile });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
exports.getMyProfile = getMyProfile;
const getProfileById = async (req, res) => {
    var _a, _b;
    try {
        const userId = parseInt(req.params.userId);
        // Only admins or the user themselves can view the profile (or maybe managers)
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const profile = await profileService.getProfileByUserId(userId);
        res.status(200).json(profile);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
exports.getProfileById = getProfileById;
const updateProfile = async (req, res) => {
    var _a, _b, _c;
    try {
        let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const _d = req.body, { userId: targetUserId } = _d, profileData = __rest(_d, ["userId"]);
        // If an admin is updating someone else's profile
        if (targetUserId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'admin') {
            userId = targetUserId;
        }
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Admins can update any field, but employees shouldn't be able to update salary/employment info
        // For simplicity, we just pass the data, but in a real app, restrict fields based on role
        // Admins can update any field, but employees shouldn't be able to update salary/employment info
        // For simplicity, we just pass the data, but in a real app, restrict fields based on role
        if (((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== 'admin') {
            // Remove restricted fields
            delete profileData.basicSalary;
            delete profileData.allowances;
            delete profileData.grossSalary;
            delete profileData.employeeCode;
            delete profileData.employmentType;
            delete profileData.salaryGrade;
            delete profileData.designation; // added restriction for designation
        }
        // Convert date strings to Date objects for Prisma
        const dateFields = ['dateOfBirth', 'joiningDate', 'confirmationDate'];
        for (const field of dateFields) {
            if (profileData[field]) {
                profileData[field] = new Date(profileData[field]);
            }
            else {
                delete profileData[field]; // Prevent updating to empty string
            }
        }
        const updatedProfile = await profileService.upsertProfile(userId, profileData);
        res.status(200).json({ message: 'Profile updated', profile: updatedProfile });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateProfile = updateProfile;
