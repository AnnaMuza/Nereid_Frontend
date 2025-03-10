import AuthService from './auth.service';
import { RouteLocationNormalized } from 'vue-router';
import ApiService from '@/services/api.service';
import { Role } from "@/types/api/users.api.types";

class PermissionService extends ApiService {

    private permissions: any = [];
    private readonly endpoints = {
        addGroupPermission: `permissions/groups/add`,
        addDirectPermission: `permissions/users/add`,
        removeDirectPermission: `permissions/users/remove`,
        removeGroupPermission: `permissions/groups/remove`,
        searchByName: `permissions/search`,
    };

    constructor() {
        super();
        AuthService.user$.subscribe((user) => {
            this.permissions = user ? [Role[user.roleId]] : [];
        });
    }

    collectPermissionFromRouter(route: RouteLocationNormalized) {
        return (route?.matched || []).reduce<string[]>((result, item) => {
            const { permissions } = item.meta;
            return [...result, ...(permissions || [])];
        }, []);
    }

    userCan(checkPermissions: string[]) {
        if (!checkPermissions.length) { return true; }
        return checkPermissions.some((p) => (this.permissions || []).includes(p));
    }
}

export default new PermissionService();
