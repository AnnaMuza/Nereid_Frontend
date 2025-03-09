import { BehaviorSubject, concat, filter, map, of, switchMap, take } from 'rxjs';
import ApiService from '@/services/api.service';
import { UsersApi } from '@/types/api';

class AuthService extends ApiService {

    public readonly user$ = new BehaviorSubject<UsersApi.User.Get | null>(null);
    private readonly TOKEN_KEY = 'access_token';
    private readonly endpoints = {
        login: 'user/log-in',
        me: 'get'
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

    logout() {
        this.user$.next(null);
        this.resetAuthToken();
    }

    getMe() {
        return concat(
            this.user$.pipe(
                take(1)
            ),
            of(null).pipe(
                switchMap(() => {
                    return this.get<{
                        user: UsersApi.User.Get
                    }>(this.endpoints.me).pipe(
                        map(({ data }) => {
                            const { user } = data;
                            if (!user) {
                                throw new Error('User is empty');
                            }
                            this.user$.next(user);
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

    private setAuthToken(token: string, remember: boolean = false) {
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

export default new AuthService();
