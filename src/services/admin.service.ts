import { BehaviorSubject, Observable, tap } from 'rxjs';
import ApiService from '@/services/api.service';
import { UsersApi } from '@/types/api';
import { map } from "rxjs/operators";
import UserService from "@/services/user.service";

class AdminService extends ApiService {
  // public readonly admin$ = new BehaviorSubject<UsersApi.Admin.AdminResponse | null>(null);
  public readonly students$ = new BehaviorSubject<UsersApi.Admin.Student[]>([]);
  public readonly teachers$ = new BehaviorSubject<UsersApi.Admin.Teacher[]>([]);
  public readonly disciplines$ = new BehaviorSubject<UsersApi.Admin.Discipline[]>([]);
  private readonly endpoints = {
    healthy: '/admin/healthy',
    getAdmin: '/admin/get',
    editAdmin: '/admin/edit',
    getAllStudents: '/admin/get-all-students',
    getAllDisciplines: '/admin/get-all-disciplines',
    releaseTeacherFromDiscipline: '/admin/release-teacher-from-discipline',
    getDiscipline: (disciplineId: number | string) => `/admin/get-discipline/${disciplineId}`,
    deleteDiscipline: (disciplineId: number | string) => `/admin/delete-discipline/${disciplineId}`,
    getAllTeachers: '/admin/get-all-teachers',
    addStudent: '/admin/add-student',
    addDiscipline: '/admin/add-discipline',
    addTeacher: '/admin/add-teacher',
    editStudent: (id: number | string) => `/admin/edit-student/${id}`,
    editTeacher: (id: number | string) => `/admin/edit-teacher/${id}`
  }

  // Health check
  // checkHealth(): Observable<UsersApi.Admin.HealthyResponse> {
  //   return this.get<UsersApi.Admin.HealthyResponse>(this.endpoints.healthy);
  // }
  //
  // // Admin profile management
  // getAdminProfile(): Observable<UsersApi.Admin.AdminResponse> {
  //   return this.get<UsersApi.Admin.AdminResponse>(this.endpoints.getAdmin).pipe(
  //     map(response => {
  //       this.admin$.next(response.admin);
  //       return response;
  //     })
  //   );
  // }

  editAdminProfile(data: UsersApi.Admin.EditAdmin): Observable<UsersApi.Admin.AdminResponse> {
    return this.patch<UsersApi.Admin.EditAdmin, UsersApi.Admin.AdminResponse>(this.endpoints.editAdmin, data).pipe(
      map(() => {
        UserService.getMe();
      })
    );
  }

  // Student management
  getAllStudents(): Observable<UsersApi.Admin.StudentsResponse> {
    return this.get<UsersApi.Admin.StudentsResponse>(this.endpoints.getAllStudents).pipe(
      map(response => {
        this.students$.next(response.students);
        return response;
      })
    );
  }

  addStudent(data: UsersApi.Admin.AddStudent): Observable<UsersApi.Admin.GenericResponse> {
    return this.post<UsersApi.Admin.AddStudent, UsersApi.Admin.GenericResponse>(this.endpoints.addStudent, data).pipe(
      tap(() => this.getAllStudents().subscribe())
    );
  }

  editStudent(id: number, data: UsersApi.Admin.EditStudent): Observable<UsersApi.Admin.GenericResponse> {
    return this.patch<UsersApi.Admin.EditStudent, UsersApi.Admin.GenericResponse>(
      this.endpoints.editStudent(id),
      data
    ).pipe(
      tap(() => this.getAllStudents().subscribe())
    );
  }

  // Teacher management
  getAllTeachers(): Observable<UsersApi.Admin.TeachersResponse> {
    return this.get<UsersApi.Admin.TeachersResponse>(this.endpoints.getAllTeachers).pipe(
      map(response => {
        this.teachers$.next(response.teachers);
        return response;
      })
    );
  }

  addTeacher(data: UsersApi.Admin.AddTeacher): Observable<UsersApi.Admin.GenericResponse> {
    return this.post<UsersApi.Admin.AddTeacher, UsersApi.Admin.GenericResponse>(this.endpoints.addTeacher, data).pipe(
      tap(() => this.getAllTeachers().subscribe())
    );
  }

  editTeacher(id: number, data: UsersApi.Admin.EditTeacher): Observable<UsersApi.Admin.GenericResponse> {
    return this.patch<UsersApi.Admin.EditTeacher, UsersApi.Admin.GenericResponse>(
      this.endpoints.editTeacher(id),
      data
    ).pipe(
      tap(() => this.getAllTeachers().subscribe())
    );
  }

  // Discipline management
  getAllDisciplines(): Observable<UsersApi.Admin.DisciplinesResponse> {
    return this.get<UsersApi.Admin.DisciplinesResponse>(this.endpoints.getAllDisciplines).pipe(
      map(response => {
        this.disciplines$.next(response.disciplines);
        return response;
      })
    );
  }

  getDiscipline(id: number): Observable<UsersApi.Admin.DisciplineResponse> {
    return this.get<UsersApi.Admin.DisciplineResponse>(this.endpoints.getDiscipline(id));
  }

  addDiscipline(data: UsersApi.Admin.AddDiscipline): Observable<UsersApi.Admin.GenericResponse> {
    return this.post<UsersApi.Admin.AddDiscipline, UsersApi.Admin.GenericResponse>(this.endpoints.addDiscipline, data).pipe(
      tap(() => this.getAllDisciplines().subscribe())
    );
  }

  deleteDiscipline(id: number): Observable<UsersApi.Admin.GenericResponse> {
    return this.delete<UsersApi.Admin.GenericResponse>(this.endpoints.deleteDiscipline(id)).pipe(
      tap(() => this.getAllDisciplines().subscribe())
    );
  }

  // Role and discipline assignments
  releaseTeacherFromDiscipline(data: UsersApi.Admin.ReleaseTeacherFromDiscipline): Observable<UsersApi.Admin.GenericResponse> {
    return this.patch<UsersApi.Admin.ReleaseTeacherFromDiscipline, UsersApi.Admin.GenericResponse>(
      this.endpoints.releaseTeacherFromDiscipline,
      data
    ).pipe(
      tap(() => {
        // Refresh both teachers and disciplines after this operation
        this.getAllTeachers().subscribe();
        this.getAllDisciplines().subscribe();
      })
    );
  }
}

export default new AdminService();
