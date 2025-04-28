<template>
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
                        rows="10"
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

            <Divider v-if="disciplineTeachers.length" class="py-3"/>

            <div v-if="disciplineTeachers.length" class="d-flex flex-column gap-2">
                <div style="padding-left: 0.75rem" class="mb-2">Teacher</div>
                <div v-for="teacher in disciplineTeachers" :key="teacher.id">
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
                </div>
            </div>
        </template>
    </Card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, reactive } from 'vue';
import StudentService from '@/services/student.service';
import { UsersApi } from '@/types/api';
import { Subscription } from 'rxjs';
import { useRoute } from 'vue-router';
import { useToast } from "primevue/usetoast";

export default defineComponent({
    name: 'DisciplineDetails',
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
        const discipline = ref<UsersApi.Student.Discipline | null>(null);
        const disciplineFields = ref<UsersApi.Student.Field[]>([]);
        const disciplineTeachers = ref<UsersApi.Student.GetDisciplineResponse['disciplineTeachers']>([]);
        const selectedFields = ref<number[]>([]);
        const loading = ref(false);
        const error = ref<string | null>(null);
        const subscriptions = new Set<Subscription>();
        const showAddField = ref(false);

        const disciplineForm = reactive({
            name: '',
            description: '',
            credits: '',
            semester: '',
        });

        const fetchDisciplineDetails = () => {
            loading.value = true;

            const subscription = StudentService.getDiscipline(id).subscribe({
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
            selectedFields,
            loading,
            error,
            showAddField,
        };
    }
});
</script>
