import { UsersApi } from ".";

export namespace Teacher {
  // Common types
  export interface Field {
    id: number;
    name?: string;
    content?: string;
    teacherId: number;
  }

  export interface Get {
    teacher: UsersApi.User.Get & { userId: number };
    allTeacherFields: Field[];
  }

  export interface Discipline {
    id: number;
    name: string;
    credits: number;
    semester: string;
    description: string | null;
    isActive: boolean | null;
  }

  export interface EditRequest {
    email: string;
    firstName: string;
    lastName: string;
    patronymic?: string;
  }

  export interface EditResponse {
    message: string;
  }

  export interface AddFieldRequest {
    teacherId: number;
    fieldName: string;
    fieldContent: string;
  }

  export interface AddFieldResponse {
    message: string;
  }

  export interface DeleteFieldResponse {
    message: string;
  }

  // Discipline endpoints
  export type GetAllDisciplinesResponse = Discipline[];

  export type GetAllTakenDisciplinesResponse = Discipline[];

  export interface GetDisciplineResponse {
    discipline: Discipline;
    disciplineFields: Field[];
    disciplineTeachers: {
      id: number;
      firstName: string;
      lastName: string;
      patronymic: string;
    }[];
  }

  export interface TakeDisciplineRequest {
    teacherId: number;
    disciplineId: number;
  }

  export interface TakeDisciplineResponse {
    message: string;
  }

  export interface ReleaseDisciplineRequest {
    teacherId: number;
    disciplineId: number;
  }

  export interface ReleaseDisciplineResponse {
    message: string;
  }

  export interface AddFieldToDisciplineRequest {
    disciplineId: number;
    fieldName: string;
    fieldContent: string;
  }

  export interface AddFieldToDisciplineResponse {
    message: string;
  }

  export interface DeleteFieldFromDisciplineResponse {
    message: string;
  }

  export interface EditDisciplineRequest {
    name: string;
    description?: string;
    semester: string;
    credits: number;
  }

  export interface EditDisciplineResponse {
    message: string;
  }

  // Error response
  export interface ErrorResponse {
    message: string;
  }
}
