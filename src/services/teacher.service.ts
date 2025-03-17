import { BehaviorSubject, Observable, tap } from 'rxjs';
import ApiService from '@/services/api.service';
import { UsersApi } from '@/types/api';
import { map } from "rxjs/operators";
import UserService from "@/services/user.service";

class TeacherService extends ApiService {
  private readonly endpoints = {
    health: '/teacher/healthy',

    // Teacher endpoints
    getTeacher: '/teacher/get',
    editTeacher: '/teacher/edit', // :id
    addField: '/teacher/add-field',
    deleteField: '/teacher/delete-field/:fieldId',

    // Discipline endpoints
    getAllDisciplines: '/teacher/get-all-disciplines',
    takeDiscipline: '/teacher/take-discipline',
    releaseDiscipline: '/teacher/release-discipline',
    getAllTakenDisciplines: '/teacher/get-all-taken-disciplines/:teacherId',

    getDiscipline: '/teacher/get-discipline/:id',
    editDiscipline: '/teacher/edit-discipline/:id',
    addFieldToDiscipline: '/teacher/add-field-to-discipline',
    deleteFieldFromDiscipline: '/teacher/delete-field-from-discipline/:fieldId'
  };


  editTeacherProfile(id: number, data: UsersApi.Teacher.EditRequest): Observable<UsersApi.Teacher.EditResponse> {
    return this.patch<UsersApi.Teacher.EditRequest, UsersApi.Teacher.EditResponse>(`${this.endpoints.editTeacher}/${id}`, data).pipe(
      map((response) => {
        UserService.getMe();
        return response;
      })
    );
  }
}

export default new TeacherService();
