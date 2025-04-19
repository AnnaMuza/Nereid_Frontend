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
            <Button
                class="d-flex mb-4"
                style="width: fit-content; align-self: center;"
                label="Take Disciplines"
                @click="takeDisciplines"
                :disabled="!hasNewDisciplinesToTake"
            />
            <div class="d-flex flex-column gap-4 overflow-y-scroll h-100">
                <div v-for="discipline in disciplines" :key="discipline.id" class="d-flex gap-2 align-items-center">
                    <Checkbox
                        class="taken"
                        v-model="selectedDisciplines"
                        :value="discipline.id"
                        :binary="false"
                        :disabled="isAlreadyTaken(discipline.id)"
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
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import TeacherService from '@/services/teacher.service';
import { UsersApi } from '@/types/api';
import { Subscription } from 'rxjs';
import DisciplineDetails from "@/views/teacher/Discipline.vue";

export default defineComponent({
    name: 'AllDisciplines',
    components: {DisciplineDetails},
    setup() {
        const disciplines = ref<UsersApi.Teacher.Discipline[]>([]);
        const selectedDisciplines = ref<number[]>([]);
        const takenDisciplines = ref<UsersApi.Teacher.Discipline[]>([]);
        const teacher = ref<UsersApi.Teacher.Get['teacher'] | null>(null);
        const loading = ref(false);
        const error = ref<string | null>(null);
        const subscriptions = new Set<Subscription>();
        const disciplineDetailsVisible = ref<boolean>(false);
        const disciplineDetails = ref<UsersApi.Student.Discipline | null>(null);

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
                    disciplines.value = response;
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

        const fetchTeacher = () => {
            const subscription = TeacherService.getTeacher().subscribe({
                next: (response) => {
                    teacher.value = response.teacher;
                    fetchTakenDisciplines(response.teacher.id);
                },
                error: (err) => {
                    console.error('Failed to load teacher data', err);
                }
            });

            subscriptions.add(subscription);
        };

        const fetchTakenDisciplines = (teacherId: number) => {
            const subscription = TeacherService.getAllTakenDisciplines(teacherId).subscribe({
                next: (response) => {
                    takenDisciplines.value = response;
                },
                error: (err) => {
                    console.error('Failed to load taken disciplines', err);
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
                    error: (err) => {
                        error.value = 'Failed to take disciplines';
                        console.error(err);
                        loading.value = false;
                    }
                });

                subscriptions.add(subscription);
            });
        };

        onMounted(() => {
            fetchTeacher();
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
        };
    }
});
</script>
