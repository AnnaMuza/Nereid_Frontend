<template>
    <ConfirmDialog></ConfirmDialog>

    <Card>
        <template #content>
            <div class="d-flex flex-column gap-5">
                <div class="d-flex gap-3">
                    <Chip>
                        Semester: {{ disciplineForm.semester }}
                    </Chip>

                    <Chip>
                        Credits: {{ disciplineForm.credits }}
                    </Chip>
                </div>

                <FloatLabel variant="over">
                    <label for="disciplineDescription">Short Description</label>
                    <Textarea
                        v-model="disciplineForm.description"
                        rows="3"
                        variant="filled"
                        id="disciplineDescription"
                    />
                </FloatLabel>
            </div>

            <!-- Discipline fields section -->
            <div class="d-flex flex-column mt-3">
                <div class="d-flex flex-column gap-3">
                    <div v-for="field in disciplineFields" :key="field.id" class="d-flex align-items-center gap-3">
                        <div class="flex-grow-1">
                            <small style="padding-left: 0.75rem">{{ field.name }}</small>
                            <Message class="mt-1">{{ field.content }}</Message>
                        </div>
                    </div>
                </div>
            </div>

            <Divider v-if="disciplineTeachers.length" class="py-4"/>

            <div v-if="disciplineTeachers.length" class="d-flex flex-column gap-2">
                <div style="padding-left: 0.75rem" class="mb-2">Teacher</div>
                <div v-for="teacher in disciplineTeachers" :key="teacher.id">
                    <div class="d-flex gap-2 align-items-center">
                        <Chip style="width: fit-content">
                            <router-link
                                :to="{
                                        name: 'student-teacher',
                                        params: {
                                            id: teacher.id
                                        }
                                    }">
                                <div>{{ teacher.lastName }} {{ teacher.firstName }} {{ teacher.patronymic }}</div>
                            </router-link>
                        </Chip>
                        <Button
                            rounded
                            severity="danger"
                            icon="pi pi-minus-circle"
                            @click="confirmRelease(teacher)"/>
                    </div>
                </div>
            </div>
        </template>
    </Card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, reactive } from 'vue';
import AdminService from '@/services/admin.service';
import { UsersApi } from '@/types/api';
import { Subscription } from 'rxjs';
import { useRoute } from 'vue-router';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

export default defineComponent({
    name: 'EditDisciplineDialog',
    props: {
        disciplineId: {
            type: Number,
            required: false
        }
    },
    setup(props) {
        const route = useRoute();
        const id = props.disciplineId || Number(route.params.id);
        const toast = useToast();
        const confirm = useConfirm();
        const discipline = ref<UsersApi.Admin.DisciplineResponse['discipline'] | null>(null);
        const disciplineFields = ref<UsersApi.Admin.DisciplineResponse['disciplineFields']>([]);
        const disciplineTeachers = ref<UsersApi.Admin.DisciplineResponse['disciplineTeachers']>([]);
        const loading = ref(false);
        const error = ref<string | null>(null);
        const subscriptions = new Set<Subscription>();

        const disciplineForm = reactive({
            name: '',
            description: '',
            credits: '',
            semester: '',
        });

        const confirmRelease = (teacher: UsersApi.Admin.DisciplineResponse['disciplineTeachers'][number]) => {
            confirm.require({
                message: `Are you sure you want to release ${teacher.lastName} ${teacher.firstName} ${teacher.patronymic}?`,
                header: 'Confirmation',
                icon: 'pi pi-exclamation-triangle',
                rejectProps: {
                    label: 'Cancel',
                    severity: 'secondary',
                },
                acceptProps: {
                    label: 'Release',
                    severity: 'danger',
                },
                accept: () => {
                    releaseTeacherFromDiscipline(teacher.id);
                },
                reject: () => {}
            });
        };

        const fetchDisciplineDetails = () => {
            loading.value = true;

            const subscription = AdminService.getDiscipline(id).subscribe({
                next: (response) => {
                    discipline.value = response.discipline;
                    disciplineFields.value = response.disciplineFields;
                    disciplineTeachers.value = response.disciplineTeachers;

                    // Update form data
                    disciplineForm.name = response.discipline.name;
                    disciplineForm.description = response.discipline.description || '';
                    disciplineForm.credits = response.discipline.credits.toString() || '';
                    disciplineForm.semester = response.discipline.semester || '';

                    loading.value = false;
                },
                error: (err) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Failed to load discipline details',
                        detail: err.response?.data.message,
                        life: 3000
                    });
                    loading.value = false;
                }
            });

            subscriptions.add(subscription);
        };

        const releaseTeacherFromDiscipline = (teacherId: number) => {
            loading.value = true;

            const subscription = AdminService.releaseTeacherFromDiscipline({
                teacherId,
                disciplineId: id,
            }).subscribe({
                next: () => {
                    toast.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Teacher released from discipline',
                        life: 3000
                    });
                    fetchDisciplineDetails();
                    loading.value = false;
                },
                error: (err) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Failed to release teacher from discipline',
                        detail: err.response?.data.message,
                        life: 3000
                    });
                    loading.value = false;
                }
            });

            subscriptions.add(subscription);
        };

        onMounted(() => {
            fetchDisciplineDetails();
        });

        onUnmounted(() => {
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            discipline,
            disciplineFields,
            disciplineTeachers,
            disciplineForm,
            loading,
            error,
            confirmRelease,
        };
    }
});
</script>
