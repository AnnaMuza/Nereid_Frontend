<template>
    <Card>
        <template #content>
            <div class="d-flex flex-column gap-5 mt-20">
                <FloatLabel variant="over">
                    <label for="lastName">Last Name*</label>
                    <InputText
                        id="lastName"
                        v-model="lastName"
                    />
                    <small v-if="submitted && !lastName.trim()" class="p-error">Last Name is required.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="firstName">First Name*</label>
                    <InputText
                        id="firstName"
                        v-model="firstName"
                    />
                    <small v-if="submitted && !firstName.trim()" class="p-error">First Name is required.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="patronymic">Patronymic</label>
                    <InputText
                        id="patronymic"
                        v-model="patronymic"
                    />
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="email">Email*</label>
                    <InputText
                        id="email"
                        v-model="email"
                    />
                    <small v-if="submitted && !UtilsService.isEmail(email)" class="p-error">PLease enter valid email.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="group">Educational program*</label>
                    <InputText
                        id="group"
                        v-model="educationalProgram"/>
                    <small v-if="submitted && !educationalProgram.trim()" class="p-error">Educational program is required.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label class="z-3" for="course">Course*</label>
                    <InputNumber
                        id="course"
                        fluid
                        v-model="course"
                        allow-empty
                        :format="false"/>
                    <small v-if="submitted && !course" class="p-error">Course is required.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label class="z-3" for="year">Year</label>
                    <InputNumber
                        id="year"
                        fluid
                        v-model="year"
                        allow-empty
                        :format="false"
                      />
                </FloatLabel>

                <div class="d-flex gap-2">
                    <Checkbox v-model="canSelect" binary/>
                    <span>Can select</span>
                </div>
            </div>

            <Button
                v-if="editMode"
                class="d-flex mt-4"
                style="justify-self: center;"
                label="Edit student"
                @click="editProfile"/>

            <Button
                v-else
                class="d-flex mt-4"
                style="justify-self: center;"
                label="Add student"
                @click="addProfile"/>
        </template>
    </Card>
</template>

<style lang="scss" scoped>

</style>

<script lang="ts">
import { defineComponent, ref, onUnmounted, PropType } from 'vue';
import { Subscription } from 'rxjs';
import AdminService from '@/services/admin.service';
import { useToast } from 'primevue/usetoast';
import { UsersApi } from "@/types/api";
import UtilsService from "@/services/utils.service";

export default defineComponent({
    name: 'StudentDialog',
    props: {
        editData: {
            type: Object as PropType<UsersApi.Admin.EditStudent>,
            required: false,
        },
    },
    emits: ['reload'],
    setup(props, {emit}) {
        const subscriptions = new Set<Subscription>();
        const toast = useToast();
        const submitted = ref<boolean>(false);
        const editMode = ref<boolean>(false);
        const firstName = ref<string>('');
        const lastName = ref<string>('');
        const patronymic = ref<string>('');
        const email = ref<string>('');
        const educationalProgram = ref<string>('');
        const course = ref<number | undefined>();
        const year = ref<number | undefined>();
        const canSelect = ref<boolean>(false);
        let wasChanged = false;

        if (props.editData) {
            editMode.value = true;
            firstName.value = props.editData.firstName || '';
            lastName.value = props.editData.lastName || '';
            patronymic.value = props.editData.patronymic || '';
            email.value = props.editData.email || '';
            educationalProgram.value = props.editData.educationalProgram || '';
            course.value = props.editData.course ? Number(props.editData.course) : undefined;
            year.value = props.editData.year ? Number(props.editData.year) : undefined;
            canSelect.value = props.editData.canSelect ?? false;
        }

        const editProfile = () => {
            submitted.value = true;

            // Simple validation
            if (firstName.value.trim() && lastName.value.trim() && email.value.trim() &&
                educationalProgram.value.trim() && course.value && UtilsService.isEmail(email.value)) {
                const userData: UsersApi.Admin.EditStudent = {
                    id: props.editData!.id,
                    firstName: firstName.value.trim(),
                    lastName: lastName.value.trim(),
                    patronymic: patronymic.value.trim(),
                    email: email.value.trim().toLowerCase(),
                    educationalProgram: educationalProgram.value.trim(),
                    course: course.value.toString(),
                    canSelect: canSelect.value,
                };

                if (year.value?.toString().trim()) {
                    userData.year = year.value.toString();
                }

                const subscription = AdminService.editStudent(userData).subscribe({
                    next: () => {
                        wasChanged = true;
                        toast.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Profile updated successfully',
                            life: 3000
                        });
                    },
                    error: ({ response } = {}) => {
                        toast.add({
                            severity: 'error',
                            summary: 'Failed to update profile',
                            detail: response?.data.message,
                            life: 5000
                        });
                    },
                });

                subscriptions.add(subscription);
            }
        };

        const addProfile = () => {
            submitted.value = true;

            // Simple validation
            if (firstName.value.trim() && lastName.value.trim() && email.value.trim() &&
                educationalProgram.value.trim() && course.value && UtilsService.isEmail(email.value)) {
                const userData: UsersApi.Admin.AddStudent = {
                    firstName: firstName.value.trim(),
                    lastName: lastName.value.trim(),
                    patronymic: patronymic.value.trim(),
                    email: email.value.trim().toLowerCase(),
                    educationalProgram: educationalProgram.value.trim(),
                    course: course.value.toString(),
                    canSelect: canSelect.value,
                };

                if (year.value?.toString().trim()) {
                    userData.year = year.value.toString();
                }

                const subscription = AdminService.addStudent(userData).subscribe({
                    next: () => {
                        emit('reload');
                        toast.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Student created successfully',
                            life: 3000
                        });
                    },
                    error: ({ response } = {}) => {
                        toast.add({
                            severity: 'error',
                            summary: 'Failed to create student',
                            detail: response?.data.message,
                            life: 5000
                        });
                    },
                });

                subscriptions.add(subscription);
            }
        };

        onUnmounted(() => {
            if (wasChanged) {
                emit('reload');
            }
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            firstName,
            lastName,
            patronymic,
            email,
            educationalProgram,
            year,
            submitted,
            editProfile,
            addProfile,
            editMode,
            course,
            canSelect,
            UtilsService,
        };
    }
});
</script>
