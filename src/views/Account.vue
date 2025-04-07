<template>

<Card>
    <template #header>
        <CardHeader icon="user" title="My Account"/>
    </template>

    <template #content>
        <div class="d-flex flex-column gap-5 mt-20">
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
                <label for="patronymic">Patronymic</label>
                <InputText
                    id="patronymic"
                    v-model="patronymic"
                    aria-describedby="patronymic-help"
                    :class="{ 'p-invalid': submitted && !patronymic }"
                />
                <small v-if="submitted && !patronymic" class="p-error">Patronymic is required.</small>
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
        </div>
        <Button
            v-if="PermissionService.userCan([RoleName.admin, RoleName.teacher])"
            class="d-flex mt-4"
            style="justify-self: center;"
            label="Save"
            @click="saveProfile"/>

        <div v-if="PermissionService.userCan([RoleName.teacher])">
            <Divider class="my-5"/>
            <div class="d-flex flex-column">
                <div class="d-flex flex-column gap-3">
                    <div v-for="field in fields" :key="field.id" class="d-flex align-items-center gap-3">
                        <Checkbox v-model="selectedFields" :value="field.id"/>
                        <div class="flex-grow-1">
                            <small style="padding-left: 0.75rem">{{ field.name }}</small>
                            <Message class="mt-1">{{ field.content }}</Message>
                        </div>
                    </div>
                </div>

                <!-- Add new field form -->
                <div v-if="showAddField" class="d-flex flex-column my-4">
                    <div class="d-flex flex-row gap-4">
                        <InputText v-model="newField.name" placeholder="Field name"/>
                        <InputText v-model="newField.content" placeholder="Field content"/>
                    </div>
                    <div class="d-flex gap-3 justify-content-around mt-4">
                        <Button label="Save Field" @click="saveNewField"/>
                        <Button label="Cancel" @click="cancelAddField" severity="secondary"/>
                    </div>
                </div>

                <div v-if="!showAddField" class="d-flex gap-3 justify-content-around mt-4">
                    <Button
                        label="Add field"
                        @click="showAddFieldForm"
                    />
                    <Button
                        label="Delete field"
                        severity="info"
                        :disabled="selectedFields.length === 0"
                        @click="deleteSelectedFields"
                    />
                </div>
            </div>
        </div>

        <div v-if="PermissionService.userCan([RoleName.student])" class="mt-5 d-flex flex-column gap-5">
            <FloatLabel variant="over">
                <label for="group">Group</label>
                <InputText
                    id="group"
                    v-model="group"
                    aria-describedby="group-help"/>
            </FloatLabel>

            <FloatLabel variant="over">
                <label for="year">Year</label>
                <InputText
                    id="year"
                    v-model="year"
                    aria-describedby="year-help"/>
            </FloatLabel>
        </div>
    </template>
</Card>

</template>

<script lang="ts">
import { defineComponent, onUnmounted, reactive, ref } from 'vue';
import UserService from '@/services/user.service';
import AdminService from '@/services/admin.service';
import PermissionService from "@/services/permission.service";
import { Role, RoleName } from "@/types/api/user.api.types";
import TeacherService from "@/services/teacher.service";
import { UsersApi } from '@/types/api';
import { Subscription } from "rxjs";
import StudentService from "@/services/student.service";

interface Data {
    firstName: string;
    lastName: string;
    patronymic: string;
    email: string;
    user: UsersApi.User.Get | null;
    submitted: boolean;
    PermissionService: typeof PermissionService;
}

export default defineComponent({
    name: 'Account',
    computed: {
        RoleName() {
            return RoleName
        }
    },
    data(): Data {
        return {
            firstName: '',
            lastName: '',
            patronymic: '',
            email: '',
            user: null,
            submitted: false,
            PermissionService,
        };
    },
    created() {
        // Subscribe to user data changes
        UserService.user$.subscribe((user) => {
            this.email = user?.email ?? '';
            this.firstName = user?.firstName ?? '';
            this.lastName = user?.lastName ?? '';
            this.patronymic = user?.patronymic ?? '';
            this.user = user;

            if (user?.roleId === Role.teacher) {
                this.fetchTeacher();
            } else if (user?.roleId === Role.student) {
                this.fetchStudent();
            }
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

                (this.user?.roleId === Role.admin ? AdminService.editAdminProfile(userData) : TeacherService.editTeacherProfile(this.user?.id ?? -1, userData))
                    // @ts-ignore
                    .subscribe({
                        next: () => {
                            this.$toast.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Profile updated successfully',
                                life: 3000
                            });
                        },
                        error: (error: any) => {
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
    },
    setup() {
        const showAddField = ref(false);
        const loading = ref(false);
        const fields = ref<any[]>([]);
        const selectedFields = ref<number[]>([]);
        const newField = reactive({
            name: '',
            content: ''
        });
        const subscriptions = new Set<Subscription>();
        const teacher = ref<UsersApi.Teacher.Get['teacher'] | null>(null);
        const student = ref<UsersApi.Student.Get | null>(null);
        const group = ref<string>('');
        const year = ref<string>('');

        const fetchTeacher = () => {
            const subscription = TeacherService.getTeacher().subscribe({
                next: (response) => {
                    teacher.value = response.teacher;
                    fields.value = response.allTeacherFields;
                    fields.value.forEach(f => {f.selected = false});
                    loading.value = false;
                },
                error: (err) => {
                    console.error('Failed to load teacher data', err);
                    loading.value = false;
                }
            });

            subscriptions.add(subscription);
        };

        const fetchStudent = () => {
            const subscription = StudentService.getStudent().subscribe({
                next: (response) => {
                    student.value = response;
                    group.value = response.educationalProgram;
                    year.value = response.year;
                    loading.value = false;
                },
                error: (err) => {
                    console.error('Failed to load student data', err);
                    loading.value = false;
                }
            });

            subscriptions.add(subscription);
        };

        const cancelAddField = () => {
            showAddField.value = false;
        };

        const showAddFieldForm = () => {
            showAddField.value = true;
            newField.name = '';
            newField.content = '';
        };

        const saveNewField = () => {
            if (!teacher.value || !newField.name.trim()) return;

            loading.value = true;

            const subscription = TeacherService.addField({
                teacherId: teacher.value.id,
                fieldName: newField.name,
                fieldContent: newField.content
            }).subscribe({
                next: () => {
                    // Reset and hide form
                    showAddField.value = false;
                    newField.name = '';
                    newField.content = '';

                    // Refresh discipline fields
                    fetchTeacher();
                    loading.value = false;
                },
                error: (err) => {
                    err.value = 'Failed to add field';
                    console.error(err);
                    loading.value = false;
                }
            });

            subscriptions.add(subscription);
        };

        const deleteSelectedFields = () => {
            if (selectedFields.value.length === 0) return;

            loading.value = true;

            // Track how many operations are completed
            let completedOps = 0;
            const totalOps = selectedFields.value.length;

            selectedFields.value.forEach(fieldId => {
                const subscription = TeacherService.deleteField(fieldId).subscribe({
                    next: () => {
                        completedOps++;
                        // When all operations are done
                        if (completedOps === totalOps) {
                            selectedFields.value = [];
                            loading.value = false;

                            // Refresh discipline fields
                            fetchTeacher();
                        }
                    },
                    error: (err) => {
                        err.value = 'Failed to delete field';
                        console.error(err);
                        loading.value = false;
                    }
                });

                subscriptions.add(subscription);
            });
        };

        onUnmounted(() => {
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            showAddField,
            newField,
            cancelAddField,
            saveNewField,
            fields,
            showAddFieldForm,
            deleteSelectedFields,
            selectedFields,
            fetchTeacher,
            fetchStudent,
            group,
            year,
        };
    }
});
</script>
