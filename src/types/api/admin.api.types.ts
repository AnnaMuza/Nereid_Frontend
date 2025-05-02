import { UsersApi } from "@/types/api";

export namespace Admin {
    export interface Student extends UsersApi.User.Get {
        educationalProgram: string;
        course: string;
        year: string;
        isActive: boolean;
        canSelect: boolean;
        semester1MinCredits: number;
        semester1MaxCredits: number;
        semester1Credits: number;
        semester2MinCredits: number;
        semester2MaxCredits: number;
        semester2Credits: number;
    }

    export interface Teacher extends UsersApi.User.Get {
        userId: number;
    }

    export interface Discipline extends UsersApi.Teacher.Discipline {
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
        course: string;
        year: string;
    }

    export interface EditStudent {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        patronymic: string;
        educationalProgram: string;
        course: string;
        year: string;
        canSelect: boolean;
        semester1MinCredits?: number;
        semester1MaxCredits?: number;
        semester1Credits?: number;
        semester2MinCredits?: number;
        semester2MaxCredits?: number;
        semester2Credits?: number;
    }

    export interface EditStudents {
        studentIds: number[];
        isActive?: boolean;
        educationalProgram?: string;
        course?: string;
        year?: string;
        canSelect?: boolean;
        semester1MinCredits?: number;
        semester1MaxCredits?: number;
        semester2MinCredits?: number;
        semester2MaxCredits?: number;
    }

    export interface EditTeachers {
        teacherIds: number[];
        isActive: boolean;
    }

    export interface AddTeacher {
        email: string;
        firstName: string;
        lastName: string;
        patronymic: string;
    }

    export interface EditTeacher {
        id: number;
        email?: string;
        firstName?: string;
        lastName?: string;
        patronymic?: string;
        isActive?: boolean;
    }

    export interface DisciplineSelectionState {
        isSelectionLocked: boolean;
    }

    export interface EditDisciplines {
        disciplineIds: number[];
        isActive: boolean;
    }

    export type Semester = '1' | '2';

    export interface AddDiscipline {
        name: string;
        semester: Semester;
        credits: number;
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

    export interface DisciplineResponse extends UsersApi.Teacher.GetDisciplineResponse {
    }

    export type GenericResponse = {
        message: string;
    }

    export type GenericCSV = {
        csvText: string;
    }

    export type HealthyResponse = {
        status: string;
    }
}
