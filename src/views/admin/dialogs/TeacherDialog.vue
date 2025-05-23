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

<!--                <div v-if="editMode" class="d-flex flex-column">-->
<!--                    <div class="d-flex flex-column gap-3">-->
<!--                        <div v-for="field in fields" :key="field.id" class="d-flex align-items-center gap-3">-->
<!--                            <div class="flex-grow-1">-->
<!--                                <small style="padding-left: 0.75rem">{{ field.name }}</small>-->
<!--                                <Message class="mt-1" v-if="UtilsService.isURL(field.content)"><a :href="field.content" target="_blank">{{ field.content }}</a></Message>-->
<!--                                <Message v-else class="mt-1">{{ field.content }}</Message>-->
<!--                            </div>-->
<!--                        </div>-->
<!--                    </div>-->
<!--                </div>-->
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
import { defineComponent, ref, onUnmounted, PropType, onMounted } from 'vue';
import { Subscription } from 'rxjs';
import AdminService from '@/services/admin.service';
import { useToast } from 'primevue/usetoast';
import { UsersApi } from "@/types/api";
import { UtilsService } from "@/services";

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
        const fields = ref<any[]>([]);

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
            if (firstName.value.trim() && lastName.value && UtilsService.isEmail(email.value)) {
                const userData: UsersApi.Admin.EditTeacher = {
                    id: props.editData!.id,
                    firstName: firstName.value.trim(),
                    lastName: lastName.value.trim(),
                    patronymic: patronymic.value.trim(),
                    email: email.value.trim().toLowerCase(),
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
            if (firstName.value.trim() && lastName.value && UtilsService.isEmail(email.value)) {
                const userData: UsersApi.Admin.AddTeacher = {
                    firstName: firstName.value.trim(),
                    lastName: lastName.value.trim(),
                    patronymic: patronymic.value.trim(),
                    email: email.value.trim().toLowerCase(),
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

        onMounted(() => {
            // if (!editMode.value) {
            //     return;
            // }
            //
            // const subscription = StudentService.getTeacher(props.editData!.id).subscribe({
            //     next: (response) => {
            //         fields.value = response.teacherFields;
            //     },
            //     error: ({ response } = {}) => {
            //         toast.add({
            //             severity: 'error',
            //             summary: 'Failed to load teacher fields',
            //             detail: response?.data.message,
            //             life: 5000
            //         });
            //     },
            // });
            //
            // subscriptions.add(subscription);
        });

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
            UtilsService,
            fields,
        };
    }
});
</script>
