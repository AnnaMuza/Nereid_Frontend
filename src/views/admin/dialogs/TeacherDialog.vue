<template>
    <Card>
        <template #content>
            <div class="d-flex flex-column gap-5 mt-20">
                <FloatLabel variant="over">
                    <label for="lastName">Last Name*</label>
                    <InputText
                        id="lastName"
                        v-model="lastName"
                        aria-describedby="lastName-help"
                        :class="{ 'p-invalid': submitted && !lastName }"
                    />
                    <small v-if="submitted && !lastName" class="p-error">Last Name is required.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="firstName">First Name*</label>
                    <InputText
                        id="firstName"
                        v-model="firstName"
                        aria-describedby="firstName-help"
                        :class="{ 'p-invalid': submitted && !firstName }"
                    />
                    <small v-if="submitted && !firstName" class="p-error">First Name is required.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="patronymic">Patronymic*</label>
                    <InputText
                        id="patronymic"
                        v-model="patronymic"
                        aria-describedby="patronymic-help"
                        :class="{ 'p-invalid': submitted && !patronymic }"
                    />
                    <small v-if="submitted && !patronymic" class="p-error">Patronymic is required.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="email">Email*</label>
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
                v-if="editMode"
                class="d-flex mt-4"
                style="justify-self: center;"
                label="Edit teacher"
                @click="editProfile"/>

            <Button
                v-else
                class="d-flex mt-4"
                style="justify-self: center;"
                label="Add teacher"
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

export default defineComponent({
    name: 'TeacherDialog',
    props: {
        editData: {
            type: Object as PropType<UsersApi.Admin.EditTeacher>,
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
        let wasChanged = false;

        if (props.editData) {
            editMode.value = true;
            firstName.value = props.editData.firstName || '';
            lastName.value = props.editData.lastName || '';
            patronymic.value = props.editData.patronymic || '';
            email.value = props.editData.email || '';
        }

        const editProfile = () => {
            submitted.value = true;

            // Simple validation
            if (firstName.value && lastName.value && email.value && patronymic.value) {
                const userData = {
                    id: props.editData!.id,
                    firstName: firstName.value,
                    lastName: lastName.value,
                    patronymic: patronymic.value,
                    email: email.value,
                };

                const subscription = AdminService.editTeacher(userData).subscribe({
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
            if (firstName.value && lastName.value && email.value && patronymic.value) {
                const userData = {
                    firstName: firstName.value,
                    lastName: lastName.value,
                    patronymic: patronymic.value,
                    email: email.value,
                };

                const subscription = AdminService.addTeacher(userData).subscribe({
                    next: () => {
                        emit('reload');
                        toast.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Teacher created successfully',
                            life: 3000
                        });
                    },
                    error: ({ response } = {}) => {
                        toast.add({
                            severity: 'error',
                            summary: 'Failed to create teacher',
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
            submitted,
            editProfile,
            addProfile,
            editMode,
        };
    }
});
</script>
