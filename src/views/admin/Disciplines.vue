<template>

<Card>
    <template #header>
        <CardHeader icon="briefcase" title="Managing"/>
    </template>

    <template #content>
        <div class="d-flex gap-5 mt-3">
            <Button
                label="Lock discipline selection"
                size="large"
                severity="danger"
                @click="lockDisciplineSelection"/>
            <Button
                label="Unlock discipline selection"
                severity="success"
                @click="unlockDisciplineSelection"/>
        </div>

<!--        <div class="d-flex my-5 align-items-center gap-5">-->
<!--            <span>Students who meet requirements</span>-->
<!--            <Chip>4</Chip>-->
<!--        </div>-->

        <div class="d-flex flex-column my-5">
            <span class="d-flex align-self-center">Reports</span>
            <Divider/>
            <div>
                <Panel style="width: 320px">
                    <template #header>
                        <Select
                            v-model="semester"
                            :options="semesters"
                            variant="filled"
                            option-label="name"/>
                    </template>
                    <Button
                        label="Download list of students for each discipline"
                        size="large"
                        @click="getStudentsForAllDisciplines"/>
                </Panel>
            </div>
        </div>
    </template>
</Card>

</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { Subscription } from 'rxjs';
import { Semester } from "@/views/student/Disciplines.vue";
import AdminService from "@/services/admin.service";
import { useToast } from 'primevue/usetoast';
import UtilsService from "@/services/utils.service";
import { AxiosError } from "axios";
import { AxiosErrorData } from "@/types/global.interface";

export default defineComponent({
    name: 'Managing',
    setup() {
        const toast = useToast();
        const subscriptions = new Set<Subscription>();
        const semesters = ref<Semester[]>([
            { name: 'Semester 1', code: '1' },
            { name: 'Semester 2', code: '2' },
        ]);
        const semester = ref<Semester>(semesters.value[0]);

        const lockDisciplineSelection = () => {
            const subscription = AdminService.lockDisciplineSelection().subscribe({
                next: () => {
                    toast.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Locked discipline selection successfully',
                        life: 5000
                    });
                },
                error() {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Cannot lock discipline selection',
                        life: 5000
                    });
                },
            });

            subscriptions.add(subscription);
        };

        const unlockDisciplineSelection = () => {
            const subscription = AdminService.unlockDisciplineSelection().subscribe({
                next: () => {
                    toast.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Unlocked discipline selection successfully',
                        life: 5000
                    });
                },
                error() {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Cannot unlock discipline selection',
                        life: 5000
                    });
                },
            });

            subscriptions.add(subscription);
        };

        const getStudentsForAllDisciplines = () => {
            const subscription = AdminService.getStudentsForAllDisciplines(semester.value.code).subscribe({
                next: (response) => {
                    UtilsService.downloadCsv(response, 'report.csv');
                },
                error: (err: AxiosError<AxiosErrorData>) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.response?.data.message,
                        life: 3000
                    });
                },
            });

            subscriptions.add(subscription);
        };

        onMounted(() => {

        });

        onUnmounted(() => {
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            lockDisciplineSelection,
            unlockDisciplineSelection,
            getStudentsForAllDisciplines,
            semesters,
            semester,
        };
    }
});
</script>
