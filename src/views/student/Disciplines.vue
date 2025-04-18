<template>
    <Card class="card-h-100">
        <template #header>
            <CardHeader icon="list" title="Disciplines"/>
        </template>

        <template #content>
            <div class="d-flex flex-column align-items-center">
                <div class="d-flex gap-20">
                    <Select
                        v-model="semester"
                        :options="semesters"
                        variant="filled"
                        @change="fetchDisciplines(); fetchTakenDisciplines()"
                        option-label="name"/>
                    <Chip>
                        Minimum credits: {{ minimumCredits }}
                    </Chip>
                    <Chip>
                        Maximum credits: {{ maximumCredits }}
                    </Chip>
                    <Chip>
                        Current credits: {{ currentCredits }}
                    </Chip>
                </div>
                <Button
                    class="d-flex mt-4"
                    label="Select Disciplines"
                    @click="selectDisciplines"
                    :disabled="!hasNewDisciplinesToTake"
                />
            </div>
            <Divider class="my-4"/>
            <div class="d-flex flex-column gap-4 overflow-y-scroll h-100">
                <div v-for="discipline in disciplines" :key="discipline.id" class="d-flex gap-2 align-items-center">
                    <Checkbox
                        class="taken"
                        v-model="selectedDisciplines"
                        :value="discipline.id"
                        :binary="false"
                        :disabled="isAlreadyTaken(discipline.id)"
                        @change="saveState">
                    </Checkbox>
                    <Chip>
                        <router-link
                            :to="{
                                name: 'student-discipline',
                                params: {
                                    id: discipline.id
                                }
                            }">
                            <div>{{ discipline.name }}</div>
                        </router-link>
                    </Chip>
                </div>
            </div>
        </template>
    </Card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import StudentService from "@/services/student.service";
import { UsersApi } from '@/types/api';
import { Subscription } from 'rxjs';
import { useToast } from "primevue/usetoast";
import { AxiosError } from "axios";
import { AxiosErrorData } from "@/types/global.interface";
import UtilsService from "@/services/utils.service";

export interface Semester {
    name: string;
    code: string;
}

const STUDENT_DISCIPLINES_SELECTED = 'studentDisciplinesSelected';

export default defineComponent({
    name: 'AllDisciplines',
    setup() {
        const toast = useToast();
        const disciplines = ref<UsersApi.Student.Discipline[]>([]);
        const selectedDisciplines = ref<number[]>(UtilsService.getFromSessionStorage(STUDENT_DISCIPLINES_SELECTED) || []);
        const takenDisciplines = ref<UsersApi.Student.Discipline[]>([]);
        const student = ref<UsersApi.Student.Get | null>(null);
        const loading = ref(false);
        const error = ref<string | null>(null);
        const subscriptions = new Set<Subscription>();
        const semesters = ref<Semester[]>([
            { name: 'Semester 1', code: '1' },
            { name: 'Semester 2', code: '2' },
        ]);
        const semester = ref<Semester>(semesters.value[0]);
        const minimumCredits = ref<number | null>(null);
        const maximumCredits = ref<number | null>(null);
        const currentCredits = ref<number | null>(null);

        const isAlreadyTaken = (disciplineId: number): boolean => {
            return takenDisciplines.value.some(discipline => discipline.id === disciplineId);
        };

        const hasNewDisciplinesToTake = computed(() => {
            return selectedDisciplines.value.length > 0;
        });

        const fetchDisciplines = () => {
            loading.value = true;

            const subscription = StudentService.getAllDisciplines(semester.value.code).subscribe({
                next: (response) => {
                    disciplines.value = UtilsService.sortDisciplines(response.disciplines);
                    loading.value = false;
                },
                error: (err) => {
                    error.value = 'Failed to load disciplines';
                    console.error(err);
                    loading.value = false;
                }
            });

            subscriptions.add(subscription);
        };

        const fetchStudent = () => {
            const subscription = StudentService.getStudent().subscribe({
                next: (response) => {
                    student.value = response;
                    fetchTakenDisciplines();
                },
                error: (err) => {
                    console.error('Failed to load student data', err);
                }
            });

            subscriptions.add(subscription);
        };

        const fetchTakenDisciplines = () => {
            const subscription = StudentService.getAllSelectedDisciplines(semester.value.code).subscribe({
                next: (response) => {
                    takenDisciplines.value = response.selectedDisciplines;
                    minimumCredits.value = response.minimumCredits;
                    maximumCredits.value = response.maximumCredits;
                    currentCredits.value = response.currentCredits;
                },
                error: (err) => {
                    console.error('Failed to load selected disciplines', err);
                }
            });

            subscriptions.add(subscription);
        };

        const saveState = () => {
            UtilsService.saveToSessionStorage(STUDENT_DISCIPLINES_SELECTED, selectedDisciplines.value);
        }

        const selectDisciplines = () => {
            if (!student.value || !hasNewDisciplinesToTake.value) return;

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
                const subscription = StudentService.selectDiscipline(disciplineId).subscribe({
                    next: () => {
                        completedOps++;
                        // When all operations are done
                        if (completedOps === totalOps) {
                            loading.value = false;

                            // Refresh the list of taken disciplines
                            if (student.value) {
                                fetchTakenDisciplines();
                            }
                        }
                    },
                    error: (err: AxiosError<AxiosErrorData>) => {
                        toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: err.response?.data.message,
                            life: 3000
                        });
                        loading.value = false;
                    }
                });

                subscriptions.add(subscription);
            });

            UtilsService.removeFromFromSessionStorage(STUDENT_DISCIPLINES_SELECTED);
        };

        onMounted(() => {
            fetchStudent();
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
            student,
            loading,
            error,
            selectDisciplines,
            isAlreadyTaken,
            hasNewDisciplinesToTake,
            semesters,
            semester,
            fetchTakenDisciplines,
            fetchDisciplines,
            minimumCredits,
            maximumCredits,
            currentCredits,
            saveState,
        };
    }
});
</script>
