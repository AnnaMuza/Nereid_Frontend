import { BehaviorSubject, Observable, tap } from 'rxjs';
import ApiService from '@/services/api.service';
import { UsersApi } from '@/types/api';
import { map } from "rxjs/operators";
import UserService from "@/services/user.service";

class TeacherService extends ApiService {
  private readonly endpoints = {
    getTeacher: '/teacher/get',
    editTeacher: '/teacher/edit',
  }


  editTeacherProfile(data: UsersApi.Teacher.EditTeacher): Observable<UsersApi.Teacher.TeacherResponse> {
    return this.patch<UsersApi.Teacher.EditTeacher, UsersApi.Teacher.TeacherResponse>(this.endpoints.editTeacher, data).pipe(
      map(() => {
        UserService.getMe();
      })
    );
  }


}

export default new TeacherService();
