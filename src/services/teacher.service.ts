import { BehaviorSubject, Observable, tap } from 'rxjs';
import ApiService from '@/services/api.service';
import { UsersApi } from '@/types/api';
import { map } from "rxjs/operators";
import UserService from "@/services/user.service";

class TeacherService extends ApiService {
  public readonly teacher$ = new BehaviorSubject<UsersApi.Teacher.Get['teacher'] | null>(null);

  private readonly endpoints = {
    health: '/teacher/healthy',

    // Teacher endpoints
    getTeacher: '/teacher/get',
    editTeacher: '/teacher/edit', // :teacherId
    addField: '/teacher/add-field',
    deleteField: '/teacher/delete-field', // :fieldId

    // Discipline endpoints
    getAllDisciplines: '/teacher/get-all-disciplines',
    takeDiscipline: '/teacher/take-discipline',
    releaseDiscipline: '/teacher/release-discipline',
    getAllTakenDisciplines: '/teacher/get-all-taken-disciplines', // :teacherId

    getDiscipline: '/teacher/get-discipline', // :id
    editDiscipline: '/teacher/edit-discipline', // :id
    addFieldToDiscipline: '/teacher/add-field-to-discipline',
    deleteFieldFromDiscipline: '/teacher/delete-field-from-discipline' // :fieldId
  };

  // Teacher endpoints
  getTeacher(): Observable<UsersApi.Teacher.Get> {
    return this.get<UsersApi.Teacher.Get>(this.endpoints.getTeacher).pipe(
      tap(response => {
        this.teacher$.next(response.teacher);
      })
    );
  }

  editTeacherProfile(teacherId: number, data: UsersApi.Teacher.EditRequest): Observable<UsersApi.Teacher.EditResponse> {
    return this.patch<UsersApi.Teacher.EditRequest, UsersApi.Teacher.EditResponse>(`${this.endpoints.editTeacher}/${teacherId}`, data).pipe(
      map((response) => {
        UserService.getMe();
        return response;
      })
    );
  }

  addField(data: UsersApi.Teacher.AddFieldRequest): Observable<UsersApi.Teacher.AddFieldResponse> {
    return this.post<UsersApi.Teacher.AddFieldRequest, UsersApi.Teacher.AddFieldResponse>(this.endpoints.addField, data);
  }

  deleteField(fieldId: number): Observable<UsersApi.Teacher.DeleteFieldResponse> {
    return this.delete<UsersApi.Teacher.DeleteFieldResponse>(`${this.endpoints.deleteField}/${fieldId}`);
  }

  // Discipline endpoints
  getAllDisciplines(): Observable<UsersApi.Teacher.GetAllDisciplinesResponse> {
    return this.get<UsersApi.Teacher.GetAllDisciplinesResponse>(this.endpoints.getAllDisciplines);
  }

  getAllTakenDisciplines(teacherId: number): Observable<UsersApi.Teacher.GetAllTakenDisciplinesResponse> {
    return this.get<UsersApi.Teacher.GetAllTakenDisciplinesResponse>(`${this.endpoints.getAllTakenDisciplines}/${teacherId}`);
  }

  getDiscipline(id: number): Observable<UsersApi.Teacher.GetDisciplineResponse> {
    return this.get<UsersApi.Teacher.GetDisciplineResponse>(`${this.endpoints.getDiscipline}/${id}`);
  }

  takeDiscipline(data: UsersApi.Teacher.TakeDisciplineRequest): Observable<UsersApi.Teacher.TakeDisciplineResponse> {
    return this.patch<UsersApi.Teacher.TakeDisciplineRequest, UsersApi.Teacher.TakeDisciplineResponse>(this.endpoints.takeDiscipline, data);
  }

  releaseDiscipline(data: UsersApi.Teacher.ReleaseDisciplineRequest): Observable<UsersApi.Teacher.ReleaseDisciplineResponse> {
    return this.patch<UsersApi.Teacher.ReleaseDisciplineRequest, UsersApi.Teacher.ReleaseDisciplineResponse>(this.endpoints.releaseDiscipline, data);
  }

  editDiscipline(id: number, data: UsersApi.Teacher.EditDisciplineRequest): Observable<UsersApi.Teacher.EditDisciplineResponse> {
    return this.patch<UsersApi.Teacher.EditDisciplineRequest, UsersApi.Teacher.EditDisciplineResponse>(`${this.endpoints.editDiscipline}/${id}`, data);
  }

  addFieldToDiscipline(data: UsersApi.Teacher.AddFieldToDisciplineRequest): Observable<UsersApi.Teacher.AddFieldToDisciplineResponse> {
    return this.post<UsersApi.Teacher.AddFieldToDisciplineRequest, UsersApi.Teacher.AddFieldToDisciplineResponse>(this.endpoints.addFieldToDiscipline, data);
  }

  deleteFieldFromDiscipline(fieldId: number): Observable<UsersApi.Teacher.DeleteFieldFromDisciplineResponse> {
    return this.delete<UsersApi.Teacher.DeleteFieldFromDisciplineResponse>(`${this.endpoints.deleteFieldFromDiscipline}/${fieldId}`);
  }
}

export default new TeacherService();
