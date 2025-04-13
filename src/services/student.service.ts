import { BehaviorSubject, Observable, tap } from 'rxjs';
import ApiService from '@/services/api.service';
import { UsersApi } from '@/types/api';
import { map } from "rxjs/operators";
import UserService from "@/services/user.service";

class StudentService extends ApiService {
  public readonly student$ = new BehaviorSubject<UsersApi.Student.Get | null>(null);

  private readonly endpoints = {
    health: '/student/healthy',

    // Student endpoints
    getStudent: '/student/get',

    // Discipline endpoints
    getAllDisciplines: '/student/get-all-disciplines',
    getAllSelectedDisciplines: '/student/get-all-selected-disciplines',
    selectDiscipline: '/student/select-discipline', // :id
    deselectDiscipline: '/student/deselect-discipline', // :id
    getDiscipline: '/student/get-discipline', // :id
    getTeacher: '/student/get-teacher', // :id
  };

  // Student endpoints
  getStudent(): Observable<UsersApi.Student.Get> {
    return this.get<UsersApi.Student.Get>(this.endpoints.getStudent).pipe(
      tap(response => {
        this.student$.next(response);
      })
    );
  }

  // Discipline endpoints
  getAllDisciplines(semester: string): Observable<UsersApi.Student.GetAllDisciplinesResponse> {
    return this.get<UsersApi.Student.GetAllDisciplinesResponse>(this.endpoints.getAllDisciplines, {params: {semester}});
  }

  getAllSelectedDisciplines(semester: string): Observable<UsersApi.Student.GetAllSelectedDisciplinesResponse> {
    return this.get<UsersApi.Student.GetAllSelectedDisciplinesResponse>(this.endpoints.getAllSelectedDisciplines, {params: {semester}});
  }

  getDiscipline(id: number): Observable<UsersApi.Student.GetDisciplineResponse> {
    return this.get<UsersApi.Student.GetDisciplineResponse>(`${this.endpoints.getDiscipline}/${id}`);
  }

  getTeacher(id: number): Observable<UsersApi.Student.GetTeacherResponse> {
    return this.get<UsersApi.Student.GetTeacherResponse>(`${this.endpoints.getTeacher}/${id}`);
  }

  selectDiscipline(id: number): Observable<UsersApi.Student.SelectDisciplineResponse> {
    return this.patch<null, UsersApi.Student.SelectDisciplineResponse>(`${this.endpoints.selectDiscipline}/${id}`, null);
  }

  deselectDiscipline(id: number): Observable<UsersApi.Student.DeselectDisciplineResponse> {
    return this.patch<null, UsersApi.Student.DeselectDisciplineResponse>(`${this.endpoints.deselectDiscipline}/${id}`, null);
  }
}

export default new StudentService();
