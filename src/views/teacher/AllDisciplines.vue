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
            <CardHeader icon="list" title="All Disciplines"/>
        </template>

        <template #content>
            <div class="d-flex gap-20 mb-4 justify-content-center">
                <Select
                    v-model="semester"
                    :options="semesters"
                    variant="filled"
                    @change="selectedDisciplines = []"
                    option-label="name"/>
                <Button
                    label="Take Disciplines"
                    @click="takeDisciplines"
                    :disabled="!hasNewDisciplinesToTake"
                />
            </div>
            <div class="d-flex flex-column overflow-y-scroll h-100">
                <div v-for="discipline in disciplines" :key="discipline.id">
                    <div v-if="discipline.semester === semester.code" class="d-flex my-3 gap-2 align-items-center">
                        <Checkbox
                            class="taken"
                            v-model="selectedDisciplines"
                            :value="discipline.id"
                            :binary="false"
                            :disabled="isAlreadyTaken(discipline.id)"
                        />
                        <Button
                            severity="info"
                            @click="disciplineDetails = discipline; disciplineDetailsVisible = true"
                            :label="discipline.name"/>
                    </div>
                </div>
            </div>
        </template>
    </Card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import TeacherService from '@/services/teacher.service';
import { UsersApi } from '@/types/api';
import { Subscription } from 'rxjs';
import DisciplineDetails from "@/views/teacher/Discipline.vue";
import { useToast } from "primevue/usetoast";
import { Semester } from "@/views/student/Disciplines.vue";
import UtilsService from "@/services/utils.service";

export default defineComponent({
    name: 'AllDisciplines',
    components: {DisciplineDetails},
    setup() {
        const toast = useToast();
        const disciplines = ref<UsersApi.Teacher.Discipline[]>([]);
        const selectedDisciplines = ref<number[]>([]);
        const takenDisciplines = ref<UsersApi.Teacher.Discipline[]>([]);
        const teacher = ref<UsersApi.Teacher.Get['teacher'] | null>(null);
        const loading = ref(false);
        const error = ref<string | null>(null);
        const subscriptions = new Set<Subscription>();
        const disciplineDetailsVisible = ref<boolean>(false);
        const disciplineDetails = ref<UsersApi.Student.Discipline | null>(null);
        const semesters = ref<Semester[]>([
            { name: 'Semester 1', code: '1' },
            { name: 'Semester 2', code: '2' },
        ]);
        const semester = ref<Semester>(semesters.value[0]);

        const fetchTakenDisciplines = (teacherId: number) => {
            const subscription = TeacherService.getAllTakenDisciplines(teacherId).subscribe({
                next: (response) => {
                    takenDisciplines.value = response;
                },
                error: ({ response } = {}) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Failed to load taken disciplines',
                        detail: response?.data.message,
                        life: 5000
                    });
                },
            });

            subscriptions.add(subscription);
        };

        TeacherService.teacher$.subscribe((response) => {
            teacher.value = response.teacher;
            fetchTakenDisciplines(response.teacher.id);
        });

        const isAlreadyTaken = (disciplineId: number): boolean => {
            return takenDisciplines.value.some(discipline => discipline.id === disciplineId);
        };

        const hasNewDisciplinesToTake = computed(() => {
            return  selectedDisciplines.value.length > 0;
        });

        const fetchDisciplines = () => {
            loading.value = true;

            const subscription = TeacherService.getAllDisciplines().subscribe({
                next: (response) => {
                    disciplines.value = UtilsService.sortDisciplines(response);
                    loading.value = false;
                },
                error: ({ response } = {}) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Failed to load disciplines',
                        detail: response?.data.message,
                        life: 3000
                    });
                    loading.value = false;
                }
            });

            subscriptions.add(subscription);
        };

        const takeDisciplines = () => {
            if (!teacher.value || !hasNewDisciplinesToTake.value) return;

            loading.value = true;

            // Filter out disciplines that are already taken
            const disciplinesToTake = selectedDisciplines.value.filter(
                id => !takenDisciplines.value.some(discipline => discipline.id === id)
            );

            if (disciplinesToTake.length === 0) {
                loading.value = false;
                return;
            }

            // Track how many operations are completed
            let completedOps = 0;
            const totalOps = disciplinesToTake.length;

            disciplinesToTake.forEach(disciplineId => {
                const subscription = TeacherService.takeDiscipline({
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
                            summary: 'Failed to take disciplines',
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
            fetchDisciplines();
        });

        onUnmounted(() => {
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            disciplines,
            selectedDisciplines,
            takenDisciplines,
            teacher,
            loading,
            error,
            takeDisciplines,
            isAlreadyTaken,
            hasNewDisciplinesToTake,
            disciplineDetailsVisible,
            disciplineDetails,
            semesters,
            semester,
        };
    }
});
</script>
