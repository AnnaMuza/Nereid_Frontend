<template>
    <Dialog
        modal
        :draggable="false"
        class="w-75"
        v-model:visible="disciplineDetailsVisible">
        <DisciplineDialog :discipline-id="disciplineDetails?.id"/>
        <template #header>
            <CardHeader icon="book" :title="disciplineDetails?.name"/>
        </template>
    </Dialog>

    <Card class="card-h-100">
        <template #header>
            <CardHeader icon="book" title="Disciplines"/>
        </template>

        <template #content>
            <div class="d-flex justify-content-center gap-5">
                <Button
                    class="d-flex mb-4"
                    style="width: fit-content; align-self: center;"
                    label="Remove Disciplines"
                    @click="releaseDisciplines"
                    :disabled="selectedDisciplines.length === 0"
                />
                <Button
                    class="d-flex mb-4"
                    style="width: fit-content; align-self: center;"
                    label="Add Discipline"
                    @click="releaseDisciplines"
                />
            </div>

            <div class="d-flex flex-column gap-4 overflow-y-scroll h-100">
                <div v-for="discipline in disciplines" :key="discipline.id" class="d-flex gap-2 align-items-center">
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
import AdminService from '@/services/admin.service';
import { UsersApi } from '@/types/api';
import { Subscription } from 'rxjs';
import DisciplineDialog from "@/views/admin/dialogs/DisciplineDialog.vue";
import { useToast } from "primevue/usetoast";

export default defineComponent({
    name: 'DisciplinesList',
    components: { DisciplineDialog },
    setup() {
        const toast = useToast();
        const disciplines = ref<UsersApi.Admin.Discipline[]>([]);
        const selectedDisciplines = ref<number[]>([]);
        const loading = ref(false);
        const error = ref<string | null>(null);
        const subscriptions = new Set<Subscription>();
        const disciplineDetailsVisible = ref<boolean>(false);
        const disciplineDetails = ref<UsersApi.Admin.Discipline | null>(null);

        const fetchDisciplines = () => {
            loading.value = true;

            const subscription = AdminService.getAllDisciplines().subscribe({
                next: (response) => {
                    // @ts-ignore
                    disciplines.value = response;
                    loading.value = false;
                },
                error: (err) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load students',
                        life: 3000
                    });
                    loading.value = false;
                }
            });

            subscriptions.add(subscription);
        };

        const releaseDisciplines = () => {
            // if (!teacher.value || selectedDisciplines.value.length === 0) return;
            //
            // loading.value = true;
            //
            // // Track how many operations are completed
            // let completedOps = 0;
            // const totalOps = selectedDisciplines.value.length;
            //
            // selectedDisciplines.value.forEach(disciplineId => {
            //     const subscription = TeacherService.releaseDiscipline({
            //         teacherId: teacher.value!.id,
            //         disciplineId: disciplineId
            //     }).subscribe({
            //         next: () => {
            //             completedOps++;
            //             // When all operations are done
            //             if (completedOps === totalOps) {
            //                 loading.value = false;
            //                 selectedDisciplines.value = [];
            //
            //                 // Refresh the list of taken disciplines
            //                 if (teacher.value) {
            //                     fetchTakenDisciplines(teacher.value.id);
            //                 }
            //             }
            //         },
            //         error: (err) => {
            //             error.value = 'Failed to release disciplines';
            //             console.error(err);
            //             loading.value = false;
            //         }
            // error: ({ response } = {}) => {
            //     toast.add({
            //         severity: 'error',
            //         summary: 'Failed to load teacher data',
            //         detail: response?.data.message,
            //         life: 5000
            //     });
            //     loading.value = false;
            // },
            //     });
            //
            //     subscriptions.add(subscription);
            // });
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
            loading,
            error,
            releaseDisciplines,
            disciplineDetailsVisible,
            disciplineDetails,
        };
    }
});
</script>
