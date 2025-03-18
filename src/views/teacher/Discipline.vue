<template>
    <Card>
        <template #header>
            <CardHeader icon="book" :title="discipline?.name || 'Discipline Details'"/>
        </template>

        <template #content>
            <div class="d-flex flex-column gap-5 mt-20">
                <FloatLabel variant="over">
                    <label for="disciplineName">Name</label>
                    <InputText v-model="disciplineForm.name" id="disciplineName"/>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="disciplineDescription">Short Description</label>
                    <Textarea
                        v-model="disciplineForm.description"
                        rows="3"
                        id="disciplineDescription"
                    />
                </FloatLabel>
            </div>
            <Button class="d-flex mt-4"
                    style="justify-self: center;"
                    label="Save"
                    @click="saveDiscipline" />

            <Divider class="my-5"/>

            <!-- Discipline fields section -->
            <div class="d-flex flex-column">
                <div class="d-flex flex-column gap-4">
                    <div v-for="(field, index) in disciplineFields" :key="index" class="d-flex align-items-center gap-3">
                        <Checkbox v-model="selectedFields" :binary="true"/>
                        <div class="flex-grow-1">
                            <small style="padding-left: 0.75rem">{{ field.name }}</small>
                            <Message class="mt-1">{{ field.content }}</Message>
                        </div>
                    </div>
                </div>

                <!-- Add new field form -->
                <div v-if="showAddField" class="d-flex flex-column my-4">
                    <div class="d-flex flex-row gap-4">
                        <InputText v-model="newField.name" placeholder="Field name"/>
                        <InputText v-model="newField.content" placeholder="Field content"/>
                    </div>
                    <div class="d-flex gap-3 justify-content-around mt-4">
                        <Button label="Save Field" @click="saveNewField"/>
                        <Button label="Cancel" @click="cancelAddField" severity="secondary"/>
                    </div>
                </div>

                <div class="d-flex gap-3 justify-content-around mt-4">
                    <Button
                        v-if="!showAddField"
                        label="Add field"
                        @click="showAddFieldForm"
                    />
                    <Button
                        v-if="!showAddField"
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

        const discipline = ref<UsersApi.Teacher.Discipline | null>(null);
        const disciplineFields = ref<UsersApi.Teacher.Field[]>([]);
        const selectedFields = ref<number[]>([]);
        const loading = ref(false);
        const error = ref<string | null>(null);
        const subscriptions = new Set<Subscription>();
        const showAddField = ref(false);

        const disciplineForm = reactive({
            name: '',
            description: ''
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

                    loading.value = false;
                },
                error: (err) => {
                    error.value = 'Failed to load discipline details';
                    console.error(err);
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
                description: disciplineForm.description
            }).subscribe({
                next: () => {
                    // Refresh discipline data
                    fetchDisciplineDetails();
                    loading.value = false;
                },
                error: (err) => {
                    error.value = 'Failed to save discipline details';
                    console.error(err);
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
                    error.value = 'Failed to add field';
                    console.error(err);
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
                        error.value = 'Failed to delete field';
                        console.error(err);
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
            deleteSelectedFields
        };
    }
});
</script>

<style scoped src="@/views/temp.css"></style>
