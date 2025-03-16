export enum Role {
    admin = 1,
    teacher,
    student
}

export const RoleName = {
    admin: 'admin',
    teacher: 'teacher',
    student: 'student'
} as const;

export namespace User {
    export interface Get {
        id: number;
        firstName: string;
        lastName: string;
        patronymic: string;
        email: string;
        roleId: number;
        isActive?: boolean;
    }

    export interface Login {
        email: string;
        password: string;
    }

    export type LoginResponse = {
        message: string;
        user: Get;
        token: string;
    }

    export interface ChangePassword {
        password: string;
    }

    export interface SignUp {
        email: string;
    }

    export interface CheckOtp {
        email: string;
        otp: string;
    }

    export interface SendOtp {
        email: string;
    }

    // Response types based on common API patterns
    export type SignUpResponse = {
        message: string;
    }

    export type CheckOtpResponse = {
        message: string;
        token: string;
        user: Get;
    }

    export type SendOtpResponse = {
        message: string;
    }

    export type ChangePasswordResponse = {
        message: string;
    }
}
