import { UsersApi } from "@/types/api";

export namespace Admin {
    export interface Student extends UsersApi.User.Get {
        group: string;
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
        group: string;
        year: string;
    }

    export interface EditStudent {
        email?: string;
        firstName?: string;
        lastName?: string;
        patronymic?: string;
        group?: string;
        year?: string;
        isActive?: boolean;
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
