import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';
import type { User } from '../../types/index';

export interface UserDocument extends Omit<User, 'id'>, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ['admin', 'member', 'viewer'],
            default: 'admin',
        },
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLoginAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = ret._id.toString();
                delete (ret as any)._id;
                delete (ret as any).__v;
                delete ret.password;
                return ret;
            },
        },
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password!, 12);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password!);
};

userSchema.index({ email: 1, isActive: 1 });

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
