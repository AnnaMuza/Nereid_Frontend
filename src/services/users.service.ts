import ApiService from '@/services/api.service';
import { UsersApi } from '@/types/api';

class UsersService extends ApiService {

    private readonly endpoints = {
        users: `users`,
        updateUser: `users`,
        searchByName: `users/search`,
        userProfile: `users/profile`,
        userProfileEmployees: `users/profile/employees`,
        userProfileStatistics: `users/profile/statistics`,
        userAdditionalInfo: `users/profile/additional-info`,
        userCard: `users/card`,
        userSurveys: `users/surveys`,
        userCardEmployees: `users/card/employees`,
        userCardStatistics: `users/card/statistics`,
        userCardSettings: `users/card/settings`
    }

    getProfileDetailed() {
        return this.get<UsersApi.User.Overview>(this.endpoints.userProfile);
    }

    getAdditionalInfo() {
        return this.get<{is_people_partner: boolean}>(this.endpoints.userAdditionalInfo);
    }

    getProfileEmployees(month: Date, skdMode: boolean) {
        return this.get<UsersApi.User.Employees[], { employeesMonthDetails: UsersApi.User.EmployeeMonthDetails[] }>(
            this.endpoints.userProfileEmployees,
            {
                params: {
                    month: this.convertTzToLocal(month),
                    skdMode
                }
            }
        );
    }

    getProfileStatistics(month: Date, skdMode: boolean) {
        return this.get<UsersApi.User.Statistics>(
            this.endpoints.userProfileStatistics,
            {
                params: {
                    month: this.convertTzToLocal(month),
                    skdMode
                }
            });
    }

    getUserCardInfo(userId: number) {
        return this.get<UsersApi.User.Overview>([this.endpoints.userCard, userId].join('/'));
    }

    getUserCardEmployees(userId: number, month: Date, skdMode: boolean) {
        return this.get<UsersApi.User.Employees[], { employeesMonthDetails: UsersApi.User.EmployeeMonthDetails[] }>(
            [this.endpoints.userCardEmployees, userId].join('/'),
            {
                params: {
                    month: this.convertTzToLocal(month),
                    skdMode
                }
            }
        );
    }

    getUserCardStatistics(userId: number, month: Date, skdMode: boolean) {
        return this.get<UsersApi.User.Statistics>(
            [this.endpoints.userCardStatistics, userId].join('/'),
            {
                params: {
                    month: this.convertTzToLocal(month),
                    skdMode
                }
            });
    }

    getUserSettingsInfo(userId: number) {
        return this.get<UsersApi.User.Settings>([this.endpoints.userCardSettings, userId].join('/'));
    }

    getUsersWithFilters(lazyParams: any) {
        return this.get<UsersApi.User.GetCollectionWithFilter[], { total: number }>(
            this.endpoints.users,
            {
                params: {
                    lazyParams: JSON.stringify(lazyParams)
                }
            }
        );
    }

    getSurveys() {
        return this.get(this.endpoints.userSurveys);
    }

    update(userId: UsersApi.User.Get['id'], data: UsersApi.User.Edit) {
        return this.post<UsersApi.User.Edit, UsersApi.User.Get>(
            [this.endpoints.updateUser, userId].join('/'),
            data
        );
    }

    deleteUser(userId: UsersApi.User.Get['id']) {
        return this.delete([this.endpoints.users, userId].join('/'))
    }

    search(query: string) {
        return this.get<UsersApi.User.GetCollectionWithFilter[]>(
            this.endpoints.searchByName,
            {
                params: {
                    query
                }
            }
        );
    }

    private convertTzToLocal(date: Date) {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    }

}

export default new UsersService();
