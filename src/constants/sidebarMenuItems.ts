import { MenuItem } from "primevue/menuitem";
import { RoleName } from "@/types/api/user.api.types";

export const sidebarMenuItems: MenuItem[] = [
  // common
    {
        label: 'My Account',
        icon: 'pi pi-user',
        route: '/account',
    },
  // admin
    {
        label: 'Managing',
        icon: 'pi pi-briefcase',
        route: '/admin/managing',
        permissions: [RoleName.admin],
    },
    {
        label: 'Students',
        icon: 'pi pi-users',
        route: '/admin/students',
        permissions: [RoleName.admin],
    },
    {
        label: 'Teachers',
        icon: 'pi pi-user-edit',
        route: '/admin/teachers',
        permissions: [RoleName.admin],
    },
    {
        label: 'Disciplines',
        icon: 'pi pi-book',
        route: '/admin/disciplines',
        permissions: [RoleName.admin],
    },
  // teacher
    {
        label: 'All Disciplines',
        icon: 'pi pi-list',
        route: '/teacher/all-disciplines',
        permissions: [RoleName.teacher],
    },
    {
        label: 'Taken Disciplines',
        icon: 'pi pi-check-square',
        route: '/teacher/taken-disciplines',
        permissions: [RoleName.teacher],
    },
  // student
    {
        label: 'My Disciplines',
        icon: 'pi pi-bookmark',
        route: '/student/my-disciplines',
        permissions: [RoleName.student],
    },
];
