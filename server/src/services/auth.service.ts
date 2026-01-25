import jwt from 'jsonwebtoken';
import config from '../config/index';
import { TenantModel, UserModel } from '../database/index';
import { ERROR_CODES } from '../types/index';
import { AppError } from '../utils/helpers';

export class AuthService {
    async register(email: string, password: string, name: string) {
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            throw new AppError('Email already registered', 409, ERROR_CODES.ALREADY_EXISTS);
        }

        const user = await UserModel.create({
            email,
            password,
            name,
            role: 'admin',
        });

        const tokens = this.generateTokens(user._id.toString(), user.email, user.role);

        return {
            user: user.toJSON(),
            ...tokens,
        };
    }

    async login(email: string, password: string) {
        const user = await UserModel.findOne({ email }).select('+password');

        if (!user || !user.isActive) {
            throw new AppError('Invalid credentials', 401, ERROR_CODES.INVALID_CREDENTIALS);
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401, ERROR_CODES.INVALID_CREDENTIALS);
        }

        user.lastLoginAt = new Date();
        await user.save();

        const tokens = this.generateTokens(
            user._id.toString(),
            user.email,
            user.role,
            user.tenantId?.toString()
        );

        return {
            user: user.toJSON(),
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
                userId: string;
                type: string;
            };

            if (decoded.type !== 'refresh') {
                throw new AppError('Invalid token type', 401, ERROR_CODES.TOKEN_INVALID);
            }

            const user = await UserModel.findById(decoded.userId);

            if (!user || !user.isActive) {
                throw new AppError('User not found', 401, ERROR_CODES.UNAUTHORIZED);
            }

            const tokens = this.generateTokens(
                user._id.toString(),
                user.email,
                user.role,
                user.tenantId?.toString()
            );

            return tokens;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new AppError('Refresh token expired', 401, ERROR_CODES.TOKEN_EXPIRED);
            }
            throw error;
        }
    }

    async getMe(userId: string) {
        const user = await UserModel.findById(userId);

        if (!user) {
            throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
        }

        let tenant = null;
        if (user.tenantId) {
            tenant = await TenantModel.findById(user.tenantId);
        }

        return {
            user: user.toJSON(),
            tenant: tenant?.toJSON(),
        };
    }

    private generateTokens(userId: string, email: string, role: string, tenantId?: string) {
        const accessToken = jwt.sign(
            { userId, email, role, tenantId },
            config.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId, type: 'refresh' },
            config.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }
}

export const authService = new AuthService();
