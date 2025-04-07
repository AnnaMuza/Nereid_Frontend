import { UsersApi } from ".";
import Discipline from "@/views/teacher/Discipline.vue";

export namespace Student {
  // Common types
  export interface Field {
    id: number;
    name?: string;
    content?: string;
    teacherId: number;
  }

  export interface Get {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    patronymic: string;
    email: string;
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

  export interface Discipline {
    id: number;
    name: string;
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
  export interface GetAllDisciplinesResponse {
    disciplines: Discipline[];
    minimumCredits: number;
    maximumCredits: number;
    currentCredits: number;
  }

  export interface GetAllSelectedDisciplinesResponse {
    selectedDisciplines: Discipline[];
    minimumCredits: number;
    maximumCredits: number;
    currentCredits: number;
  }

  export interface GetDisciplineResponse {
    discipline: Discipline;
    disciplineFields: Field[];
    disciplineTeachers: Array<{
      teacherId: number;
      firstName: string;
      lastName: string;
      patronymic?: string;
    }>;
  }

  export interface SelectDisciplineResponse {
    currentCredits: number;
  }

  export interface ReleaseDisciplineRequest {
    teacherId: number;
    disciplineId: number;
  }

  export interface DeselectDisciplineResponse {
    currentCredits: number;
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
    description: string;
  }

  export interface EditDisciplineResponse {
    message: string;
  }

  // Error response
  export interface ErrorResponse {
    message: string;
  }
}
