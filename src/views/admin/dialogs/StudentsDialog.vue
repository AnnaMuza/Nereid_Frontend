<template>
    <Card>
        <template #content>
            <div class="d-flex flex-column gap-5 mt-20">
                <FloatLabel variant="over">
                    <label for="group">Educational program</label>
                    <InputText
                        id="group"
                        v-model="educationalProgram"
                        aria-describedby="group-help"/>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label class="z-3" for="course">Course</label>
                    <InputNumber
                        id="course"
                        fluid
                        v-model="course"
                        allow-empty
                        :format="false"
                        aria-describedby="year-help"/>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label class="z-3" for="year">Year</label>
                    <InputNumber
                        id="year"
                        fluid
                        v-model="year"
                        allow-empty
                        :format="false"
                        aria-describedby="year-help"/>
                </FloatLabel>

                <div style="width: fit-content" class="d-flex gap-2 align-items-center"
                     v-tooltip="'If you want to edit &quot;canSelect&quot;, you should check &quot;override&quot;'">
                    <Checkbox v-model="canSelect" binary :disabled="!enableCanSelect"/>
                    <span>Can select</span>
                    <Divider layout="vertical"/>
                    <div class="d-flex gap-2 align-items-center">
                        <Checkbox v-model="enableCanSelect" binary/>
                        <Tag value="override" severity="secondary"/>
                    </div>
                </div>

                <FloatLabel variant="over">
                    <label class="z-3" for="semester1MinCredits">Semester 1 minimum credits</label>
                    <InputNumber
                        id="semester1MinCredits"
                        fluid
                        v-model="semester1MinCredits"
                        allow-empty
                        :format="false"/>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label class="z-3" for="semester1MaxCredits">Semester 1 maximum credits</label>
                    <InputNumber
                        id="semester1MaxCredits"
                        fluid
                        v-model="semester1MaxCredits"
                        allow-empty
                        :format="false"/>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label class="z-3" for="semester2MinCredits">Semester 2 minimum credits</label>
                    <InputNumber
                        id="semester2MinCredits"
                        fluid
                        v-model="semester2MinCredits"
                        allow-empty
                        :format="false"/>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label class="z-3" for="semester2MaxCredits">Semester 2 maximum credits</label>
                    <InputNumber
                        id="semester2MaxCredits"
                        fluid
                        v-model="semester2MaxCredits"
                        allow-empty
                        :format="false"/>
                </FloatLabel>
            </div>

            <Button
                class="d-flex mt-4"
                style="justify-self: center;"
                label="Edit students"
                @click="editProfiles"/>
        </template>
    </Card>
</template>

<style lang="scss" scoped>

</style>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from 'vue';
import { Subscription } from 'rxjs';
import AdminService from '@/services/admin.service';
import { useToast } from 'primevue/usetoast';
import { UsersApi } from '@/types/api';

export default defineComponent({
    name: 'StudentsDialog',
    props: {
        studentIds: {
            type: Array<number>,
            required: true,
        },
    },
    emits: ['reload'],
    setup(props, {emit}) {
        const subscriptions = new Set<Subscription>();
        const toast = useToast();
        const submitted = ref<boolean>(false);
        const educationalProgram = ref<string>('');
        const course = ref<number | undefined>();
        const year = ref<number | undefined>();
        const canSelect = ref<boolean>(false);
        const enableCanSelect = ref<boolean>(false);
        const semester1MinCredits = ref<number | undefined>();
        const semester1MaxCredits = ref<number | undefined>();
        const semester2MinCredits = ref<number | undefined>();
        const semester2MaxCredits = ref<number | undefined>();
        let wasChanged = false;

        const editProfiles = () => {
            submitted.value = true;
            const userData: UsersApi.Admin.EditStudents = {
                studentIds: props.studentIds,
                educationalProgram: educationalProgram.value.trim() || undefined,
                course: course.value ? course.value.toString() : undefined,
                year: year.value ? year.value.toString(): undefined,
                canSelect: enableCanSelect.value ? canSelect.value : undefined,
                semester1MinCredits: semester1MinCredits.value,
                semester1MaxCredits: semester1MaxCredits.value,
                semester2MinCredits: semester2MinCredits.value,
                semester2MaxCredits: semester2MaxCredits.value,
            };

            let key: keyof typeof userData;
            for (key in userData) {
                if (userData[key] === undefined) {
                    delete userData[key];
                }
            }

            if (Object.keys(userData).length <= 1) {
                toast.add({
                    severity: 'info',
                    summary: 'Nothing to update',
                    life: 3000
                });
                return;
            }

            const subscription = AdminService.editStudents(userData).subscribe({
                next: () => {
                    wasChanged = true;
                    toast.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Profiles updated successfully',
                        life: 3000
                    });
                },
                error: ({ response } = {}) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Failed to update profiles',
                        detail: response?.data.message,
                        life: 5000
                    });
                },
            });

            subscriptions.add(subscription);
        };

        onUnmounted(() => {
            if (wasChanged) {
                emit('reload');
            }
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            educationalProgram,
            year,
            submitted,
            editProfiles,
            course,
            canSelect,
            semester1MinCredits,
            semester1MaxCredits,
            semester2MinCredits,
            semester2MaxCredits,
            enableCanSelect,
        };
    }
});
</script>
