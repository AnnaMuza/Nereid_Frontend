<template>
    <Dialog
        modal
        :draggable="false"
        class="w-75"
        v-model:visible="disciplineDetailsVisible">
        <DisciplineDetails :discipline-id="disciplineDetails?.id"/>
        <template #header>
            <CardHeader icon="book" :title="disciplineDetails?.name"/>
        </template>
    </Dialog>

    <Card class="card-h-100">
        <template #header>
            <CardHeader icon="check-circle" title="Taken Disciplines"/>
        </template>

        <template #content>
            <Button
                class="d-flex mb-4"
                style="width: fit-content; align-self: center;"
                label="Release Disciplines"
                @click="releaseDisciplines"
                :disabled="selectedDisciplines.length === 0"
            />
            <div class="d-flex flex-column gap-4 overflow-y-scroll h-100">
                <div v-for="discipline in takenDisciplines" :key="discipline.id" class="d-flex gap-2 align-items-center">
                    <Checkbox
                        v-model="selectedDisciplines"
                        :value="discipline.id"
                        :binary="false"
                    />
                    <Chip>
                        <Button
                            text
                            class="p-0"
                            @click="disciplineDetails = discipline; disciplineDetailsVisible = true"
                            :label="discipline.name"/>
                        | Semester {{ discipline.semester }}
                    </Chip>
                </div>
            </div>
        </template>
    </Card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import TeacherService from '@/services/teacher.service';
import { UsersApi } from '@/types/api';
import { Subscription } from 'rxjs';
import DisciplineDetails from "@/views/teacher/Discipline.vue";
import { useToast } from "primevue/usetoast";

export default defineComponent({
    name: 'TakenDisciplines',
    components: {DisciplineDetails},
    setup() {
        const toast = useToast();
        const takenDisciplines = ref<UsersApi.Teacher.Discipline[]>([]);
        const selectedDisciplines = ref<number[]>([]);
        const teacher = ref<UsersApi.Teacher.Get['teacher'] | null>(null);
        const loading = ref(false);
        const error = ref<string | null>(null);
        const subscriptions = new Set<Subscription>();
        const disciplineDetailsVisible = ref<boolean>(false);
        const disciplineDetails = ref<UsersApi.Student.Discipline | null>(null);

        const fetchTeacher = () => {
            const subscription = TeacherService.getTeacher().subscribe({
                next: (response) => {
                    teacher.value = response.teacher;
                    fetchTakenDisciplines(response.teacher.id);
                },
                error: ({ response } = {}) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Failed to load teacher data',
                        detail: response?.data.message,
                        life: 5000
                    });
                },
            });

            subscriptions.add(subscription);
        };

        const fetchTakenDisciplines = (teacherId: number) => {
            loading.value = true;

            const subscription = TeacherService.getAllTakenDisciplines(teacherId).subscribe({
                next: (response) => {
                    takenDisciplines.value = response;
                    loading.value = false;
                },
                error: ({ response } = {}) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Failed to load taken disciplines',
                        detail: response?.data.message,
                        life: 5000
                    });
                    loading.value = false;
                },
            });

            subscriptions.add(subscription);
        };

        const releaseDisciplines = () => {
            if (!teacher.value || selectedDisciplines.value.length === 0) return;

            loading.value = true;

            // Track how many operations are completed
            let completedOps = 0;
            const totalOps = selectedDisciplines.value.length;

            selectedDisciplines.value.forEach(disciplineId => {
                const subscription = TeacherService.releaseDiscipline({
                    teacherId: teacher.value!.id,
                    disciplineId: disciplineId
                }).subscribe({
                    next: () => {
                        completedOps++;
                        // When all operations are done
                        if (completedOps === totalOps) {
                            loading.value = false;
                            selectedDisciplines.value = [];

                            // Refresh the list of taken disciplines
                            if (teacher.value) {
                                fetchTakenDisciplines(teacher.value.id);
                            }
                        }
                    },
                    error: ({ response } = {}) => {
                        toast.add({
                            severity: 'error',
                            summary: 'Failed to release disciplines',
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
            fetchTeacher();
        });

        onUnmounted(() => {
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            takenDisciplines,
            selectedDisciplines,
            teacher,
            loading,
            error,
            releaseDisciplines,
            disciplineDetailsVisible,
            disciplineDetails,
        };
    }
});
</script>
