// @ts-nocheck
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { take, tap } from 'rxjs';
import AuthService from '@/services/user.service';
import PermissionService from '@/services/permission.service';
import ToastsService from '@/services/toasts.service';
import { RoleName } from "@/types/api/user.api.types";
// Routes templates
const LeftSidebarTemplate = () => import('@/templates/routes/LeftSidebar.template.vue');
// Routes
const Login = () => import('@/views/Login.vue');
const Managing = () => import('@/views/admin/Managing.vue');
const Account = () => import('@/views/Account.vue');
const AllDisciplines = () => import('@/views/teacher/AllDisciplines.vue');
const TakenDisciplines = () => import('@/views/teacher/TakenDisciplines.vue');
const Discipline = () => import('@/views/teacher/Discipline.vue');
const Disciplines = () => import('@/views/student/Disciplines.vue');
const SelectedDisciplines = () => import('@/views/student/SelectedDisciplines.vue');
const Teacher = () => import('@/views/student/Teacher.vue');

// TODO 404 routes for groups of routes

const recursiveSearchCanEnterRoute = (route: RouteRecordRaw): RouteRecordRaw | null => {
    const { meta, name, children, path = '' } = route;
    const { permissions = [] } = meta || {};
    const hasPermissions = !permissions.length || PermissionService.userCan(permissions);
    const needParams = new RegExp(/:/gm).test(path);
    if (!needParams) {
        if (name && hasPermissions) {
            return route;
        } else if (children && children.length && hasPermissions) {
            for (const child of children) {
                const childRoute = recursiveSearchCanEnterRoute(child);
                if (childRoute) {
                    return childRoute;
                }
            }
        }
    }
    return null;
}

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        component: Login,
        name: 'login',
        beforeEnter: (to, from, next) => {
            AuthService.user$.pipe(
                take(1)
            ).subscribe((user) => {
                if (user && AuthService.authToken) {
                    const authorizedRoutes = routes.find(({ path }) => path === '/');
                    if (authorizedRoutes) {
                        const hasPermissionsRoute = recursiveSearchCanEnterRoute(authorizedRoutes);
                        if (hasPermissionsRoute) {
                            router.replace({ name: hasPermissionsRoute.name }).then(() => {});
                        }
                    }
                } else {
                    next();
                }
            });
        }
    },
    {
        path: '/',
        component: LeftSidebarTemplate,
        beforeEnter: (to, from, next) => {
            if (to.path === '/') {
                const authorizedRoutes = routes.find(({ path }) => path === '/');
                if (authorizedRoutes) {
                    const hasPermissionsRoute = recursiveSearchCanEnterRoute(authorizedRoutes);
                    if (hasPermissionsRoute) {
                        router.replace({ name: hasPermissionsRoute.name }).then(() => {});
                    }
                }
            } else {
                next();
            }
        },
        children: [
            {
                path: 'account',
                component: Account,
                name: 'account'
            },
            {
                path: 'admin',
                meta: {
                    permissions: [RoleName.admin]
                },
                children: [
                    {
                        path: 'managing',
                        component: Managing,
                        name: 'managing'
                    },
                ]
            },
            {
                path: 'teacher',
                meta: {
                    permissions: [RoleName.teacher]
                },
                children: [
                    {
                        path: 'all-disciplines',
                        component: AllDisciplines,
                        name: 'all-disciplines'
                    },
                    {
                        path: 'taken-disciplines',
                        component: TakenDisciplines,
                        name: 'taken-disciplines'
                    },
                    {
                        path: 'discipline/:id',
                        component: Discipline,
                        name: 'teacher-discipline'
                    },
                ]
            },
            {
                path: 'student',
                meta: {
                    permissions: [RoleName.student]
                },
                children: [
                    {
                        path: 'disciplines',
                        component: Disciplines,
                        name: 'disciplines'
                    },
                    {
                        path: 'selected-disciplines',
                        component: SelectedDisciplines,
                        name: 'selected-disciplines'
                    },
                    {
                        path: 'teacher/:id',
                        component: Teacher,
                        name: 'student-teacher'
                    },
                ]
            },
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const loginRedirectQuery = to?.name && to.fullPath !== 'login' ? { redirectTo: to.fullPath.toString() } : {};
    if (!AuthService.authToken) {
        if (to.name === 'login') {
            next();
        } else {
            next({
                name: 'login',
                query: loginRedirectQuery
            });
        }
    } else {
        AuthService.getMe().pipe(
            tap((user) => {
                if (!user) {
                    AuthService.resetAuthToken();
                    throw new Error('User is null');
                }
            })
        ).subscribe({
            next: () => {
                next();
            },
            error: () => {
                AuthService.resetAuthToken();
                next({
                    name: 'login',
                    query: loginRedirectQuery
                });
            }
        });
    }
});

router.beforeEach((to, from, next) => {
    const needPermissions = PermissionService.collectPermissionFromRouter(to);
    if (!needPermissions.length) {
        next();
    } else {
        const userCan = PermissionService.userCan(needPermissions);
        if (userCan) {
            next();
        } else if (to.meta.checkHierarchy) {
            // next(false);
            next({ path: '/account' });
            ToastsService.globalToasts.next({
                severity: 'error',
                summary: 'You must have permissions OR be a chief for visit this route',
                life: 5000
            });
        } else {
            if (from.name && from.name !== 'login') {
                next(false);
            } else {
                next({ path: '/' })
            }
            ToastsService.globalToasts.next({
                severity: 'error',
                summary: 'You do not have permissions for this route',
                life: 5000
            });
        }
    }
});

export { router, routes };
