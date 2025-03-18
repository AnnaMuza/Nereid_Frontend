<template>
    <Card>
        <template #header>
            <CardHeader icon="check-circle" title="Taken Disciplines"/>
        </template>

        <template #content>
            <div class="disciplines-container">
                <div v-for="discipline in takenDisciplines" :key="discipline.id" class="discipline-item">
                    <Checkbox
                        v-model="selectedDisciplines"
                        :value="discipline.id"
                        :binary="false"
                    />
                    <div class="discipline-name">{{ discipline.name }}</div>
                </div>

                <div class="action-container">
                    <Button
                        label="Release Disciplines"
                        @click="releaseDisciplines"
                        :disabled="selectedDisciplines.length === 0"
                    />
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

export default defineComponent({
    name: 'TakenDisciplinesManager',
    setup() {
        const takenDisciplines = ref<UsersApi.Teacher.Discipline[]>([]);
        const selectedDisciplines = ref<number[]>([]);
        const teacher = ref<UsersApi.Teacher.Get | null>(null);
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

<style scoped>
.disciplines-container {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.discipline-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
}

.discipline-name {
    margin-left: 0.5rem;
}

.action-container {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}
</style>
