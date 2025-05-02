<template>
    <Card>
        <template #content>
            <div class="d-flex flex-column gap-5 mt-20">
                <FloatLabel variant="over">
                    <label for="disciplineName">Name</label>
                    <InputText v-model="disciplineForm.name" id="disciplineName"/>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="credits">Credits</label>
                    <InputText v-model="disciplineForm.credits" id="credits"/>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="semester">Semester</label>
                    <InputText v-model="disciplineForm.semester" id="semester"/>
                </FloatLabel>

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
            <Button class="d-flex mt-4"
                    style="justify-self: center;"
                    label="Save"
                    @click="saveDiscipline" />

            <Divider class="my-3"/>

            <!-- Discipline fields section -->
            <div class="d-flex flex-column">
                <div class="d-flex flex-column gap-3">
                    <div v-for="field in disciplineFields" :key="field.id" class="d-flex align-items-center gap-3">
                        <Checkbox v-model="selectedFields" :value="field.id"/>
                        <div class="flex-grow-1">
                            <small style="padding-left: 0.75rem">{{ field.name }}</small>
                            <Message class="mt-1" v-if="UtilsService.isURL(field.content)"><a :href="field.content" target="_blank">{{ field.content }}</a></Message>
                            <Message v-else class="mt-1">{{ field.content }}</Message>
                        </div>
                    </div>
                </div>

                <!-- Add new field form -->
                <div v-if="showAddField" class="d-flex flex-column">
                    <div class="d-flex flex-row gap-4 mt-4">
                        <InputText v-model="newField.name" placeholder="Field name"/>
                        <InputText v-model="newField.content" placeholder="Field content"/>
                    </div>
                    <div class="d-flex gap-3 justify-content-around mt-4">
                        <Button label="Save Field" @click="saveNewField"/>
                        <Button label="Cancel" @click="cancelAddField" severity="secondary"/>
                    </div>
                </div>

                <div v-if="!showAddField" class="d-flex gap-3 justify-content-around mt-4">
                    <Button
                        label="Add field"
                        @click="showAddFieldForm"
                    />
                    <Button
                        label="Delete field"
                        @click="deleteSelectedFields"
                        :disabled="selectedFields.length === 0"
                        severity="secondary"
                    />
                </div>
            </div>
        </template>
    </Card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, reactive } from 'vue';
import TeacherService from '@/services/teacher.service';
import { UsersApi } from '@/types/api';
import { Subscription } from 'rxjs';
import { useRoute } from 'vue-router';
import { useToast } from "primevue/usetoast";
import { UtilsService } from "@/services";

export default defineComponent({
    name: 'DisciplineDetails',
    props: {
        disciplineId: {
            type: Number,
            required: false
        }
    },
    emits: ['reload'],
    setup(props, {emit}) {
        const route = useRoute();
        const id = props.disciplineId || Number(route.params.id);
        const toast = useToast();
        const discipline = ref<UsersApi.Teacher.Discipline | null>(null);
        const disciplineFields = ref<UsersApi.Teacher.Field[]>([]);
        const selectedFields = ref<number[]>([]);
        const loading = ref(false);
        const error = ref<string | null>(null);
        const subscriptions = new Set<Subscription>();
        const showAddField = ref(false);
        let wasChanged = false;

        const disciplineForm = reactive({
            name: '',
            description: '',
            credits: '',
            semester: '',
        });

        const newField = reactive({
            name: '',
            content: ''
        });

        const fetchDisciplineDetails = () => {
            loading.value = true;

            const subscription = TeacherService.getDiscipline(id).subscribe({
                next: (response) => {
                    discipline.value = response.discipline;
                    disciplineFields.value = response.disciplineFields;

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

        const saveDiscipline = () => {
            if (!discipline.value) return;

            loading.value = true;

            const subscription = TeacherService.editDiscipline(id, {
                name: disciplineForm.name,
                description: disciplineForm.description,
                semester: disciplineForm.semester,
                credits: +disciplineForm.credits,
            }).subscribe({
                next: () => {
                    wasChanged = true;
                    toast.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Discipline details saved',
                        life: 3000
                    });

                    // Refresh discipline data
                    fetchDisciplineDetails();
                    loading.value = false;
                },
                error: (err) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Failed to save discipline details',
                        detail: err.response?.data.message,
                        life: 3000
                    });
                    loading.value = false;
                }
            });

            subscriptions.add(subscription);
        };

        const showAddFieldForm = () => {
            showAddField.value = true;
            newField.name = '';
            newField.content = '';
        };

        const cancelAddField = () => {
            showAddField.value = false;
        };

        const saveNewField = () => {
            if (!discipline.value || !newField.name.trim()) return;

            loading.value = true;

            const subscription = TeacherService.addFieldToDiscipline({
                disciplineId: discipline.value.id,
                fieldName: newField.name,
                fieldContent: newField.content
            }).subscribe({
                next: () => {
                    // Reset and hide form
                    showAddField.value = false;
                    newField.name = '';
                    newField.content = '';

                    // Refresh discipline fields
                    fetchDisciplineDetails();
                    loading.value = false;
                },
                error: (err) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Failed to add field',
                        detail: err.response?.data.message,
                        life: 3000
                    });
                    loading.value = false;
                }
            });

            subscriptions.add(subscription);
        };

        const deleteSelectedFields = () => {
            if (selectedFields.value.length === 0) return;

            loading.value = true;

            // Track how many operations are completed
            let completedOps = 0;
            const totalOps = selectedFields.value.length;

            selectedFields.value.forEach(fieldId => {
                const subscription = TeacherService.deleteFieldFromDiscipline(fieldId).subscribe({
                    next: () => {
                        completedOps++;
                        // When all operations are done
                        if (completedOps === totalOps) {
                            selectedFields.value = [];
                            loading.value = false;

                            // Refresh discipline fields
                            fetchDisciplineDetails();
                        }
                    },
                    error: (err) => {
                        toast.add({
                            severity: 'error',
                            summary: 'Failed to delete field',
                            detail: err.response?.data.message,
                            life: 3000
                        });
                        loading.value = false;
                    }
                });

                subscriptions.add(subscription);
            });
        };

        onMounted(() => {
            fetchDisciplineDetails();
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
            discipline,
            disciplineFields,
            disciplineForm,
            selectedFields,
            loading,
            error,
            showAddField,
            newField,
            saveDiscipline,
            showAddFieldForm,
            cancelAddField,
            saveNewField,
            deleteSelectedFields,
            UtilsService,
        };
    }
});
</script>
