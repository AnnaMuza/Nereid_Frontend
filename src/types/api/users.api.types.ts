import { PartialBy } from '../global.interface';

export enum Role {
    admin = 1,
    teacher,
    student
}

export const RoleName = {
    admin: 'admin',
    teacher: 'teacher',
    student: 'student'
} as const;

export type RoleString = typeof RoleName[keyof typeof RoleName];

export namespace UsersApi {

    export namespace User {

        export interface Get {
            id: number,
            firstName: string,
            lastName: string,
            patronymic: string,
            email: string,
            roleId: number,
            // roleName: string,
        }

        export type Create = Omit<Get, 'id'>
        export type Edit = PartialBy<Omit<Get, 'id' | 'created_at' | 'group' | 'permissions' | 'updated_at'>, 'email'>

        export type GetCollectionWithFilter = Pick<Get, 'id'> & {
            createdAt: Get['firstName'],
            groups: any[]
        }

        export type Overview = {
            department: {
                id: number;
                name: string;
            } | null;
            teamLead: {
                id: number;
                name: string;
            } | null;
            visitor: {
                id: number;
                name: string;
            } | null;
            BambooID: number;
            user_id: number;
            email: string;
            full_name: string;
            job_title: string;
            people_partner: string;
            status: number;
            hasEmployees: 0 | 1;
            hasSurveys: 0 | 1;
            hire_date: string;
            years_of_service: number;
        }

        type TScoreIndicators = {
            hours: number;
            days: number;
        }

        export type Employees = {
            bhr_id: number;
            department: string;
            full_name: string;
            id: number;
            job_title: string;
            nickname: string;
            people_partner: string;
            office: TScoreIndicators;
            avg_office_days_weekly: string;
            office_hours_of_worktime: string;
            planed: TScoreIndicators;
            time_off: TScoreIndicators;
            work_trips: TScoreIndicators;
        }

        export type Settings = {
            status: number;
            visitor: {
                id: number;
                name: string;
            } | null,
            groups: any[],
            permissions_from_group: number[],
            direct_permissions: number[]
        }

        export type Statistics = {
            monthDetails: EmployeeMonthDetails[],
            totalScore: Pick<
                Employees,
                'avg_office_days_weekly' | 'office_hours_of_worktime' | 'planed' |
            'time_off' | 'work_trips' | 'office'>
        }

        export type VisitsByDay = {
            day: string;
            dayTitle: string;
            isHoliday: boolean;
            hasVacation: boolean;
            hasSickLeave: boolean;
            hasOtherVacations: boolean;
            hasBirthday: boolean;
            hasWorkTrips: boolean;
            isWeekend: boolean;
            office: string | null;
            hours_in_office: number;
            net_office_hours: number;
            details: {
                enter_control: number;
                enter_date: string;
                exit_control: number;
                exit_date: string;
            }[] | []
        }

        export type EmployeeMonthDetails = {
            office: string;
            visitor: string;
            data: VisitsByDay[]
        }

        export interface Login {
            email: string;
            password: string;
        }

        export type LoginResponse = {
            message: string;
            user: Get
            token: string;
        }

    }
}
