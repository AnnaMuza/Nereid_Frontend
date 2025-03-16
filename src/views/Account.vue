<template>

<Card>
    <template #header>
        <CardHeader icon="user" title="My Account"/>
    </template>

    <template #content>
        <div class="d-flex flex-column gap-5">
            <FloatLabel variant="over">
                <label for="firstName">First Name</label>
                <InputText
                    id="firstName"
                    v-model="firstName"
                    aria-describedby="firstName-help"
                    :class="{ 'p-invalid': submitted && !firstName }"
                />
                <small v-if="submitted && !firstName" class="p-error">First Name is required.</small>
            </FloatLabel>

            <FloatLabel variant="over">
                <label for="lastName">Last Name</label>
                <InputText
                    id="lastName"
                    v-model="lastName"
                    aria-describedby="lastName-help"
                    :class="{ 'p-invalid': submitted && !lastName }"
                />
                <small v-if="submitted && !lastName" class="p-error">Last Name is required.</small>
            </FloatLabel>

            <FloatLabel variant="over">
                <label for="email">Email</label>
                <InputText
                    id="email"
                    v-model="email"
                    aria-describedby="email-help"
                    :class="{ 'p-invalid': submitted && !email }"
                />
                <small v-if="submitted && !email" class="p-error">Email is required.</small>
            </FloatLabel>

            <div class="d-flex justify-content-center">
                <Button label="Save" @click="saveProfile" />
            </div>
        </div>

        <div v-if="PermissionService.userCan([RoleName.teacher])">
            <Divider class="my-5"/>
            <div class="d-flex flex-column gap-5">
                <div v-for="(field, index) in customFields" :key="index" class="d-flex align-items-center gap-3">
                    <Checkbox v-model="field.selected" :binary="true"/>
                    <div class="flex-grow-1">
                        <FloatLabel variant="over">
                            <label :for="'field' + index" class="mb-2">{{ field.name }}</label>
                            <InputText
                                :id="'field' + index"
                                v-model="field.value"
                                class="w-100"
                            />
                        </FloatLabel>
                    </div>
                </div>

                <div class="d-flex gap-3 justify-content-around">
                    <Button
                        label="Add field"
                        @click="addCustomField"
                    />
                    <Button
                        label="Delete field"
                        @click="deleteSelectedFields"
                    />
                </div>
            </div>
        </div>
    </template>
</Card>

</template>

<style lang="scss" scoped>

::v-deep(.p-inputtext) {
    width: 100%;
    padding-block: 0.7rem;
}

</style>

<script lang="ts">
import { defineComponent } from 'vue';
import UserService from '@/services/user.service';
import AdminService from '@/services/admin.service';
import PermissionService from "@/services/permission.service";
import { Role, RoleName } from "@/types/api/user.api.types";
import TeacherService from "@/services/teacher.service";

export default defineComponent({
    name: 'Account',
    computed: {
        RoleName() {
            return RoleName
        }
    },
    data() {
        return {
            firstName: '',
            lastName: '',
            patronymic: '',
            email: '',
            roleId: -1,
            submitted: false,
            PermissionService,
            customFields: [
                { name: 'Field1', value: '', selected: false },
                { name: 'Field2', value: '', selected: false }
            ],
        };
    },
    created() {
        // Subscribe to user data changes
        UserService.user$.subscribe((user) => {
            this.email = user?.email ?? '';
            this.firstName = user?.firstName ?? '';
            this.lastName = user?.lastName ?? '';
            this.patronymic = user?.patronymic ?? '';
            this.roleId = user?.roleId ?? -1;
        });
    },
    methods: {
        saveProfile() {
            this.submitted = true;

            // Simple validation
            if (this.firstName && this.lastName && this.email) {
                const userData = {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    patronymic: this.patronymic,
                    email: this.email
                };

                (this.roleId === Role.admin ? AdminService.editAdminProfile(userData) : TeacherService.editTeacherProfile(userData))
                    .subscribe({
                        next: (response) => {
                            this.$toast.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Profile updated successfully',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            this.$toast.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to update profile: ' + error.message,
                                life: 3000
                            });
                        }
                    });
            }
        },
        addCustomField() {
            const newFieldNumber = this.customFields.length + 1;
            this.customFields.push({
                name: `Field${newFieldNumber}`,
                value: '',
                selected: false
            });
        },
        deleteSelectedFields() {
            this.customFields = this.customFields.filter(field => !field.selected);
        },
    },
    beforeUnmount() {
        // Cleanup subscriptions if needed
    }
});
</script>
