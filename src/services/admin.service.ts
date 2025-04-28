import { BehaviorSubject, Observable, tap } from 'rxjs';
import ApiService from '@/services/api.service';
import { UsersApi } from '@/types/api';
import { map } from "rxjs/operators";

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
    getDiscipline: `/admin/get-discipline`, // :id
    deleteDiscipline: `/admin/delete-discipline`, // :id
    getAllTeachers: '/admin/get-all-teachers',
    addStudent: '/admin/add-student',
    addStudentsWithCsv: '/admin/add-students-with-csv',
    getStudentsCsvTemplate: '/admin/get-students-csv-template',
    addDiscipline: '/admin/add-discipline',
    editDisciplines: '/admin/edit-disciplines',
    getDisciplineSelectionState: '/admin/get-discipline-selection-state',
    addTeacher: '/admin/add-teacher',
    editStudent: `/admin/edit-student`, // :id
    editStudents: `/admin/edit-students`,
    editTeacher: `/admin/edit-teacher`, // :id
    editTeachers: `/admin/edit-teachers`,

    lockDisciplineSelection: '/admin/lock-discipline-selection',
    unlockDisciplineSelection: '/admin/unlock-discipline-selection',
    getStudentsForAllDisciplines: '/admin/get-students-for-all-disciplines',
    recalculateStudentsCredits: '/admin/recalculate-students-credits',
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
    return this.patch<UsersApi.Admin.EditAdmin, UsersApi.Admin.AdminResponse>(this.endpoints.editAdmin, data);
  }

  // Student management
  getAllStudents(): Observable<UsersApi.Admin.Student[]> {
    return this.get<UsersApi.Admin.Student[]>(this.endpoints.getAllStudents).pipe(
      map(response => {
        this.students$.next(response);
        return response;
      })
    );
  }

  addStudent(data: UsersApi.Admin.AddStudent): Observable<UsersApi.Admin.GenericResponse> {
    return this.post<UsersApi.Admin.AddStudent, UsersApi.Admin.GenericResponse>(this.endpoints.addStudent, data);
  }

  editStudent(data: UsersApi.Admin.EditStudent): Observable<UsersApi.Admin.GenericResponse> {
    return this.patch<UsersApi.Admin.EditStudent, UsersApi.Admin.GenericResponse>(
      `${this.endpoints.editStudent}/${data.id}`,
      data
    );
  }

  editStudents(data: UsersApi.Admin.EditStudents): Observable<UsersApi.Admin.GenericResponse> {
    return this.patch<UsersApi.Admin.EditStudents, UsersApi.Admin.GenericResponse>(this.endpoints.editStudents, data);
  }

  getStudentsCsvTemplate(): Observable<UsersApi.Admin.GenericCSV> {
    return this.get<UsersApi.Admin.GenericCSV>(this.endpoints.getStudentsCsvTemplate);
  }

  addStudentsWithCsv(data: UsersApi.Admin.GenericCSV): Observable<UsersApi.Admin.GenericResponse> {
    return this.post<UsersApi.Admin.GenericCSV, UsersApi.Admin.GenericResponse>(this.endpoints.addStudentsWithCsv, data);
  }

  // Teacher management
  getAllTeachers(): Observable<UsersApi.Admin.Teacher[]> {
    return this.get<UsersApi.Admin.Teacher[]>(this.endpoints.getAllTeachers).pipe(
      map(response => {
        this.teachers$.next(response);
        return response;
      })
    );
  }

  addTeacher(data: UsersApi.Admin.AddTeacher): Observable<UsersApi.Admin.GenericResponse> {
    return this.post<UsersApi.Admin.AddTeacher, UsersApi.Admin.GenericResponse>(this.endpoints.addTeacher, data);
  }

  editTeacher(data: UsersApi.Admin.EditTeacher): Observable<UsersApi.Admin.GenericResponse> {
    return this.patch<UsersApi.Admin.EditTeacher, UsersApi.Admin.GenericResponse>(
      `${this.endpoints.editTeacher}/${data.id}`,
      data
    );
  }

  editTeachers(data: UsersApi.Admin.EditTeachers): Observable<UsersApi.Admin.GenericResponse> {
    return this.patch<UsersApi.Admin.EditTeachers, UsersApi.Admin.GenericResponse>(this.endpoints.editTeachers, data);
  }

  // Discipline management
  getAllDisciplines(): Observable<UsersApi.Admin.Discipline[]> {
    return this.get<UsersApi.Admin.Discipline[]>(this.endpoints.getAllDisciplines).pipe(
      map(response => {
        this.disciplines$.next(response);
        return response;
      })
    );
  }

  getDisciplineSelectionState(): Observable<UsersApi.Admin.DisciplineSelectionState> {
    return this.get<UsersApi.Admin.DisciplineSelectionState>(this.endpoints.getDisciplineSelectionState);
  }

  editDisciplines(data: UsersApi.Admin.EditDisciplines): Observable<UsersApi.Admin.GenericResponse> {
    return this.patch<UsersApi.Admin.EditDisciplines, UsersApi.Admin.GenericResponse>(this.endpoints.editDisciplines, data);
  }

  getDiscipline(id: number): Observable<UsersApi.Admin.DisciplineResponse> {
    return this.get<UsersApi.Admin.DisciplineResponse>(`${this.endpoints.getDiscipline}/${id}`);
  }

  addDiscipline(data: UsersApi.Admin.AddDiscipline): Observable<UsersApi.Admin.GenericResponse> {
    return this.post<UsersApi.Admin.AddDiscipline, UsersApi.Admin.GenericResponse>(this.endpoints.addDiscipline, data);
  }

  deleteDiscipline(id: number): Observable<UsersApi.Admin.GenericResponse> {
    return this.delete<UsersApi.Admin.GenericResponse>(`${this.endpoints.deleteDiscipline}/${id}`);
  }

  // Role and discipline assignments
  releaseTeacherFromDiscipline(data: UsersApi.Admin.ReleaseTeacherFromDiscipline): Observable<UsersApi.Admin.GenericResponse> {
    return this.patch<UsersApi.Admin.ReleaseTeacherFromDiscipline, UsersApi.Admin.GenericResponse>(this.endpoints.releaseTeacherFromDiscipline, data);
  }

  lockDisciplineSelection(): Observable<string> {
    return this.patch<any, string>(this.endpoints.lockDisciplineSelection, {});
  }

  unlockDisciplineSelection(): Observable<string> {
    return this.patch<any, string>(this.endpoints.unlockDisciplineSelection, {});
  }

  getStudentsForAllDisciplines(semester: string): Observable<string> {
    return this.get<string>(this.endpoints.getStudentsForAllDisciplines, { params: { semester } });
  }
}

export default new AdminService();
