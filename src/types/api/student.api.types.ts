import { UsersApi } from ".";

export namespace Student {
  // Common types
  export interface Field {
    id: number;
    name: string | null;
    content: string | null;
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
    discipline: Discipline & {
      credits: number;
      semester: string;
      description: string;
    };
    disciplineFields: Field[];
    disciplineTeachers: Array<{
      id: number;
      firstName: string;
      lastName: string;
      patronymic?: string;
    }>;
  }

  export interface GetTeacherResponse {
    teacher: {
      id: number;
      userId: number;
    } & Required<UsersApi.Admin.EditTeacher>
    teacherFields: (Field & { teacherId: number })[];
  }

  export interface SelectDisciplineResponse {
    currentCredits: number;
  }

  export interface DeselectDisciplineResponse {
    currentCredits: number;
  }
}
