<template>
    <Card class="card-h-100">
        <template #header>
            <CardHeader icon="check-circle" title="Selected Disciplines"/>
        </template>

        <template #content>
            <div class="d-flex flex-column align-items-center">
                <div class="d-flex gap-20">
                    <Select
                        v-model="semester"
                        :options="semesters"
                        variant="filled"
                        @change="fetchTakenDisciplines"
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
                    label="Release Disciplines"
                    @click="deselectDisciplines"
                    :disabled="selectedDisciplines.length === 0"
                />
            </div>
            <Divider class="my-4"/>
            <div class="d-flex flex-column gap-4 overflow-y-scroll h-100">
                <div v-for="discipline in takenDisciplines" :key="discipline.id" class="d-flex gap-2 align-items-center">
                    <Checkbox
                        v-model="selectedDisciplines"
                        :value="discipline.id"
                        @change="saveState"
                        :binary="false"/>
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
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import StudentService from '@/services/student.service';
import { UsersApi } from '@/types/api';
import { Subscription } from 'rxjs';
import { Semester } from "@/views/student/Disciplines.vue";
import studentService from "@/services/student.service";
import { AxiosError } from "axios";
import { AxiosErrorData } from "@/types/global.interface";
import { useToast } from "primevue/usetoast";
import UtilsService from "@/services/utils.service";

const STUDENT_TAKEN_DISCIPLINES_SELECTED = 'studentTakenDisciplinesSelected';

export default defineComponent({
    name: 'TakenDisciplines',
    setup() {
        const toast = useToast();
        const selectedDisciplines = ref<number[]>(UtilsService.getFromSessionStorage(STUDENT_TAKEN_DISCIPLINES_SELECTED) || []);
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
                    takenDisciplines.value = UtilsService.sortDisciplines(response.selectedDisciplines);
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
            UtilsService.saveToSessionStorage(STUDENT_TAKEN_DISCIPLINES_SELECTED, selectedDisciplines.value);
        }

        const deselectDisciplines = () => {
            if (!student.value || selectedDisciplines.value.length === 0) return;

            loading.value = true;

            // Track how many operations are completed
            let completedOps = 0;
            const totalOps = selectedDisciplines.value.length;

            selectedDisciplines.value.forEach(disciplineId => {
                const subscription = studentService.deselectDiscipline(disciplineId).subscribe({
                    next: () => {
                        completedOps++;
                        // When all operations are done
                        if (completedOps === totalOps) {
                            loading.value = false;
                            selectedDisciplines.value = [];

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

            UtilsService.removeFromFromSessionStorage(STUDENT_TAKEN_DISCIPLINES_SELECTED);
        };

        onMounted(() => {
            fetchStudent();
        });

        onUnmounted(() => {
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            takenDisciplines,
            selectedDisciplines,
            student,
            loading,
            error,
            deselectDisciplines,
            semester,
            semesters,
            fetchTakenDisciplines,
            minimumCredits,
            maximumCredits,
            currentCredits,
            saveState,
        };
    }
});
</script>
