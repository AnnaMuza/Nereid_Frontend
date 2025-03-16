import { UsersApi } from "@/types/api";

export namespace Teacher {

  // Request interfaces
  export interface EditTeacher {
    email?: string;
    firstName?: string;
    lastName?: string;
    patronymic?: string;
  }

  // Response interfaces
  export type TeacherResponse = void;

}
