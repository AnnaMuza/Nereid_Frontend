import { UsersApi } from "@/types/api";

export namespace Admin {
    export interface Student extends UsersApi.User.Get {
        educationalProgram: string;
        year: string;
    }

    export interface Teacher extends UsersApi.User.Get {
        // Teacher specific fields if needed
    }

    export interface Discipline {
        id: number;
        disciplineName: string;
        // Other discipline properties
    }

    // Request interfaces
    export interface EditAdmin {
        email?: string;
        firstName?: string;
        lastName?: string;
        patronymic?: string;
    }

    export interface AddStudent {
        email: string;
        firstName: string;
        lastName: string;
        patronymic: string;
        educationalProgram: string;
        year: string;
    }

    export interface EditStudent {
        id: number;
        email?: string;
        firstName?: string;
        lastName?: string;
        patronymic?: string;
        educationalProgram?: string;
        course?: string;
        year?: string;
        isActive?: boolean;
        canSelect?: boolean;
        semester1MinCredits?: number;
        semester1MaxCredits?: number;
        semester1Credits?: number;
        semester2MinCredits?: number;
        semester2MaxCredits?: number;
        semester2Credits?: number;
    }

    export interface EditStudents {
        studentIds: number[];
        isActive: boolean;
    }

    export interface AddTeacher {
        email: string;
        firstName: string;
        lastName: string;
        patronymic: string;
    }

    export interface EditTeacher {
        email?: string;
        firstName?: string;
        lastName?: string;
        patronymic?: string;
        isActive?: boolean;
    }

    export interface AddDiscipline {
        disciplineName: string;
    }

    export interface ReleaseTeacherFromDiscipline {
        teacherId: number;
        disciplineId: number;
    }

    // Response interfaces
    export type AdminResponse = void;

    export type StudentsResponse = {
        message: string;
        students: Student[];
    }

    export type TeachersResponse = {
        message: string;
        teachers: Teacher[];
    }

    export type DisciplinesResponse = {
        message: string;
        disciplines: Discipline[];
    }

    export type DisciplineResponse = {
        message: string;
        discipline: Discipline;
    }

    export type GenericResponse = {
        message: string;
    }

    export type HealthyResponse = {
        status: string;
    }
}
