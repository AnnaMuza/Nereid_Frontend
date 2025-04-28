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
            <Divider class="my-4"/>
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
                <label for="group">Educational program</label>
                <InputText
                    id="group"
                    v-model="group"
                    aria-describedby="group-help"/>
            </FloatLabel>

            <FloatLabel variant="over">
                <label for="course">Course</label>
                <InputText
                    id="course"
                    v-model="course"
                    aria-describedby="course-help"/>
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
import { defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue';
import UserService from '@/services/user.service';
import AdminService from '@/services/admin.service';
import PermissionService from "@/services/permission.service";
import { Role, RoleName } from "@/types/api/user.api.types";
import TeacherService from "@/services/teacher.service";
import { UsersApi } from '@/types/api';
import { Subscription } from "rxjs";
import StudentService from "@/services/student.service";
import { useToast } from "primevue/usetoast";

export default defineComponent({
    name: 'Account',
    computed: {
        RoleName() {
            return RoleName
        }
    },
    setup() {
        const toast = useToast();
        const firstName = ref<string>('');
        const lastName = ref<string>('');
        const patronymic = ref<string>('');
        const email = ref<string>('');
        const user = ref<UsersApi.User.Get | null>(null);
        const submitted = ref<boolean>(false);
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
        const course = ref<string>('');

        UserService.user$.subscribe((user_) => {
            email.value = user_?.email ?? '';
            firstName.value = user_?.firstName ?? '';
            lastName.value = user_?.lastName ?? '';
            patronymic.value = user_?.patronymic ?? '';
            user.value = user_;
        });

        TeacherService.teacher$.subscribe((response) => {
            teacher.value = response.teacher;
            fields.value = response.allTeacherFields;
            fields.value.forEach(f => {f.selected = false});
            loading.value = false;
        });

        StudentService.student$.subscribe((response) => {
            student.value = response;
            group.value = response.educationalProgram;
            year.value = response.year;
            course.value = response.course;
            loading.value = false;
        });

        const saveProfile = () => {
            submitted.value = true;

            // Simple validation
            if (firstName.value && lastName.value && email.value) {
                const userData = {
                    firstName: firstName.value,
                    lastName: lastName.value,
                    patronymic: patronymic.value,
                    email: email.value,
                };

                (user.value?.roleId === Role.admin ? AdminService.editAdminProfile(userData) :
                    TeacherService.editTeacherProfile(teacher.value?.id!, userData))
                    // @ts-ignore
                    .subscribe({
                        next: () => {
                            toast.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Profile updated successfully',
                                life: 3000
                            });
                            UserService.refreshMe().subscribe();
                        },
                        error: (error: any) => {
                            toast.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to update profile: ' + error.message,
                                life: 3000
                            });
                            UserService.refreshMe().subscribe();
                        }
                    });
            }
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
                    TeacherService.getTeacher().subscribe();
                    loading.value = false;
                },
                error: ({ response } = {}) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Failed to add field',
                        detail: response?.data.message,
                        life: 5000
                    });
                    loading.value = false;
                },
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
                            TeacherService.getTeacher().subscribe();
                        }
                    },
                    error: ({ response } = {}) => {
                        toast.add({
                            severity: 'error',
                            summary: 'Failed to delete field',
                            detail: response?.data.message,
                            life: 5000
                        });
                        loading.value = false;
                    },
                });

                subscriptions.add(subscription);
            });
        };

        onMounted(() => {
            // Subscribe to user data changes

        })

        onUnmounted(() => {
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            firstName,
            lastName,
            patronymic,
            email,
            user,
            submitted,
            PermissionService,
            showAddField,
            newField,
            cancelAddField,
            saveNewField,
            fields,
            showAddFieldForm,
            deleteSelectedFields,
            selectedFields,
            group,
            year,
            course,
            saveProfile,
        };
    }
});
</script>
