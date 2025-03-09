import { MenuItem } from "primevue/menuitem";

export const sidebarMenuItems: MenuItem[] = [
    {
        label: 'Managing',
        icon: 'pi pi-briefcase',
        route: '/managing',
    },
    {
        label: 'Students',
        icon: 'pi pi-users',
        route: '/students'
    },
    {
        label: 'Teachers',
        icon: 'pi pi-user-edit',
        route: '/teachers'
    },
    {
        label: 'Disciplines',
        icon: 'pi pi-book',
        route: '/disciplines'
    },
    {
        label: 'All Disciplines',
        icon: 'pi pi-list',
        route: '/all-disciplines'
    },
    {
        label: 'Taken Disciplines',
        icon: 'pi pi-check-square',
        route: '/taken-disciplines'
    },
    {
        label: 'My Disciplines',
        icon: 'pi pi-bookmark',
        route: '/my-disciplines'
    },
];
