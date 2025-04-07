<template>
    <Card>
        <template #header>
            <CardHeader icon="check-circle" title="Taken Disciplines"/>
        </template>

        <template #content>
            <div class="d-flex flex-column gap-4">
                <div v-for="discipline in takenDisciplines" :key="discipline.id" class="d-flex gap-2 align-items-center">
                    <Checkbox
                        v-model="selectedDisciplines"
                        :value="discipline.id"
                        :binary="false"
                    />
                    <Chip>
                        <router-link
                            :to="{
                                name: 'teacher-discipline',
                                params: {
                                    id: discipline.id
                                }
                            }">
                            <div>{{ discipline.name }}</div>
                        </router-link>
                        | Semester {{ discipline.semester }}
                    </Chip>
                </div>
            </div>
            <Button
                class="d-flex mt-4"
                style="justify-self: center;"
                label="Release Disciplines"
                @click="releaseDisciplines"
                :disabled="selectedDisciplines.length === 0"
            />
        </template>
    </Card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import TeacherService from '@/services/teacher.service';
import { UsersApi } from '@/types/api';
import { Subscription } from 'rxjs';

export default defineComponent({
    name: 'TakenDisciplines',
    setup() {
        const takenDisciplines = ref<UsersApi.Teacher.Discipline[]>([]);
        const selectedDisciplines = ref<number[]>([]);
        const teacher = ref<UsersApi.Teacher.Get['teacher'] | null>(null);
        const loading = ref(false);
        const error = ref<string | null>(null);
        const subscriptions = new Set<Subscription>();

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
            loading.value = true;

            const subscription = TeacherService.getAllTakenDisciplines(teacherId).subscribe({
                next: (response) => {
                    takenDisciplines.value = response;
                    loading.value = false;
                },
                error: (err) => {
                    console.error('Failed to load taken disciplines', err);
                    error.value = 'Failed to load taken disciplines';
                    loading.value = false;
                }
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
                    error: (err) => {
                        error.value = 'Failed to release disciplines';
                        console.error(err);
                        loading.value = false;
                    }
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
            releaseDisciplines
        };
    }
});
</script>
