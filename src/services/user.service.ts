import { BehaviorSubject, concat, filter, map, of, switchMap, take } from 'rxjs';
import ApiService from '@/services/api.service';
import { UsersApi } from '@/types/api';
import { Role } from "@/types/api/user.api.types";
import TeacherService from "@/services/teacher.service";
import StudentService from "@/services/student.service";

class UserService extends ApiService {

    public readonly user$ = new BehaviorSubject<UsersApi.User.Get | null>(null);
    private readonly TOKEN_KEY = 'access_token';
    private readonly endpoints = {
        login: 'user/log-in',
        getUser: 'user/get',
        changePassword: '/user/change-password',
        signUp: '/user/sign-up',
        checkOtp: '/user/check-otp',
        sendOtp: '/user/send-otp',
    };

    public get authToken() {
        const tokenStorage = localStorage.getItem(this.TOKEN_KEY);

        if (!tokenStorage) {
            return null;
        }

        try {
            const parsedData: { token: string; exp: number; } = JSON.parse(tokenStorage);

            if (new Date().getTime() > parsedData.exp) {
                localStorage.removeItem(this.TOKEN_KEY);
                return null;
            }

            return parsedData.token;
        } catch (error) {
            localStorage.removeItem(this.TOKEN_KEY);
            return null;
        }
    }

    public resetAuthToken() {
        localStorage.removeItem(this.TOKEN_KEY);
    }

    login(data: UsersApi.User.Login, rememberMe: boolean) {
        return this.post<UsersApi.User.Login, UsersApi.User.LoginResponse>(this.endpoints.login, data).pipe(
            map((data) => {
                const { token, user } = data;
                this.setAuthToken(token, rememberMe);
                this.user$.next(user);
                return user || null;
            })
        );
    }

    signUp(data: UsersApi.User.SignUp) {
        return this.post<UsersApi.User.SignUp, UsersApi.User.SignUpResponse>(this.endpoints.signUp, data);
    }

    sendOtp(data: UsersApi.User.SignUp) {
        return this.post<UsersApi.User.SignUp, UsersApi.User.SignUpResponse>(this.endpoints.sendOtp, data);
    }

    checkOtp(data: UsersApi.User.CheckOtp) {
        return this.post<UsersApi.User.CheckOtp, UsersApi.User.CheckOtpResponse>(this.endpoints.checkOtp, data);
    }

    changePassword(data: UsersApi.User.ChangePassword) {
        return this.put<UsersApi.User.ChangePassword, UsersApi.User.ChangePasswordResponse>(this.endpoints.changePassword, data);
    }

    logout() {
        this.user$.next(null);
        this.resetAuthToken();
    }

    refreshMe() {
        return this.get<{user: UsersApi.User.Get}>(this.endpoints.getUser)
          .pipe(
            map(({user}) => {
                if (!user) {
                    throw new Error('User is empty');
                }
                this.user$.next(user);
                if (user.roleId === Role.teacher) {
                    TeacherService.getTeacher().subscribe();
                } else if (user.roleId === Role.student) {
                    StudentService.getStudent().subscribe();
                }
                return user;
            })
          );
    }

    getMe() {
        return concat(
            this.user$.pipe(
                take(1)
            ),
            of(null).pipe(
                switchMap(() => {
                    return this.get<{user: UsersApi.User.Get}>(this.endpoints.getUser)
                      .pipe(
                        map(({user}) => {
                            if (!user) {
                                throw new Error('User is empty');
                            }
                            this.user$.next(user);
                            if (user.roleId === Role.teacher) {
                                TeacherService.getTeacher().subscribe();
                            } else if (user.roleId === Role.student) {
                                StudentService.getStudent().subscribe();
                            }
                            return user;
                        })
                    );
                })
            )
        ).pipe(
            filter((user) => {
                return !!user?.id;
            }),
            take(1)
        );
    }

    public setAuthToken(token: string, remember: boolean = false) {
        const nowTimestamp = new Date().getTime();
        //store Token 30 days with @rememberMe Or 2 hours
        const ttl = (remember ? (30 * 24 * 60 * 60) : (120 * 60)) * 1000;

        const tokenStorage = {
            token,
            exp: nowTimestamp + ttl,
        }

        localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenStorage));
    }

}

export default new UserService();
