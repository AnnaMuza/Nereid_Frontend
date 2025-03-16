<template>

    <Card :class="['sidebar flex-shrink-0', { 'collapsed': !isExpanded }]">
        <template #header v-if="isExpanded">
            <div class="d-flex align-items-center pb-20">
                <div class="d-flex flex-column overflow-x-hidden">
                    <h5 class="text-dark text-truncate">{{ email }}</h5>
                    <span class="text-truncate">{{ lastName }}<br>{{ firstName }}<br>{{ patronymic }}</span>
                </div>
            </div>
        </template>

        <template #content>
            <TieredMenu :model="menuItems" breakpoint="10000px">
                <template #item="{ item, props, hasSubmenu }">
                    <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                        <a v-ripple
                           :class="{'current': $router.currentRoute.value.path === item.route}"
                           :href="href"
                           v-bind="props.action"
                           @click="navigate">
                            <span :class="[{'current': $router.currentRoute.value.path === item.route}, item.icon]"
                                  class="p-tieredmenu-item-icon"/>
                            <span class="p-tieredmenu-item-label">{{ item.label }}</span>
                        </a>
                    </router-link>
                    <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                        <span :class="item.icon" class="p-tieredmenu-item-icon"/>
                        <span class="p-tieredmenu-item-label">{{ item.label }}</span>
                        <span v-if="hasSubmenu" class="fi fi-rr-angle-small-down ms-auto" style="color: var(--bs-body-color)"/>
                    </a>
                </template>
            </TieredMenu>
        </template>

        <template #footer>
            <div class="d-flex justify-content-between align-items-center">
                <Button label="Logout"
                        v-if="isExpanded"
                        severity="info"
                        class="px-4 py-2 rounded fw-bold"
                        @click="logout()">
                </Button>
                <Button :icon="isExpanded ? 'fi fi-rr-angle-double-left' : 'fi fi-rr-angle-double-right'"
                        text rounded
                        class="text-dark"
                        @click="toggleSidebar"/>
            </div>
        </template>
    </Card>

</template>

<style lang="scss" scoped>

$sidebar-padding: calc(10px + 14px + var(--p-tieredmenu-item-gap));

.sidebar {
    margin: 5px 20px 5px 0;
    z-index: 10;
    max-height: fit-content;
    transition: width 0.5s ease;
    width: calc(var(--p-card-body-padding) * 2 + 1rem * 16 + var(--p-tieredmenu-item-gap) + 6px);

    .current {
        color: var(--bs-secondary);
    }

    &.collapsed {
        width: calc($sidebar-padding * 2 + 1.3rem);

        ::v-deep(.p-card-body) {
            scrollbar-width: none;
            padding-left: $sidebar-padding;
            padding-right: 10px;
            padding-top: var(--p-card-body-padding);

            .p-tieredmenu-item-icon {
                font-size: 1.3rem;
            }

            .p-tieredmenu-item-label {
                display: none;
            }

            .p-tieredmenu-submenu {
                padding-left: 0;
            }
        }
    }
}

::v-deep(.p-card-body) {
    gap: 0;
    overflow-y: scroll;

    :not(.p-tieredmenu-submenu, .p-tieredmenu-submenu *) {
        transition: font-size 0.3s ease;
    }

    .p-tieredmenu {
        min-width: unset;

        .p-tieredmenu-root-list {
            padding: 0;

            .p-tieredmenu-item-label {
                text-wrap: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                line-height: inherit;
            }

            .p-tieredmenu-item-link {
                padding: 8px 0;
            }
        }
    }
}

</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
    import { sidebarMenuItems } from '@/constants/sidebarMenuItems';
    import AuthService from "@/services/auth.service";
    import { router } from "@/router";
    import PermissionService from '@/services/permission.service';

    export default defineComponent({
        name: 'AppMenuSidebar',
        setup() {
            const isExpanded = ref(localStorage.getItem('sidebar_expanded') !== 'false');

            return {
                isExpanded
            };
        },
        data() {
            return {
                menuItems: sidebarMenuItems.filter(i => this.userCan(i.permissions)),
                email: '',
                firstName: '',
                lastName: '',
                patronymic: '',
            };
        },
        mounted() {
            AuthService.user$.subscribe((user) => {
                this.email = user?.email ?? '';
                this.firstName = user?.firstName ?? '';
                this.lastName = user?.lastName ?? '';
                this.patronymic = user?.patronymic ?? '';
            });
        },
        methods: {
            logout() {
                AuthService.logout();
                router.push({ name: 'login' });
            },
            toggleSidebar() {
                this.isExpanded = !this.isExpanded;
                localStorage.setItem('sidebar_expanded', String(this.isExpanded));
            },
            userCan(permissions: string[] = []): boolean {
                return PermissionService.userCan(permissions);
            },
        }
    })
</script>
