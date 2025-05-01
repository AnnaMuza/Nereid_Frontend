<template>
    <Card>
        <template #content>
            <div class="d-flex flex-column gap-5 mt-20">
                <FloatLabel variant="over">
                    <label for="group">Educational program*</label>
                    <InputText
                        id="group"
                        v-model="educationalProgram"
                        :class="{ 'p-invalid': submitted && !educationalProgram }"
                        aria-describedby="group-help"/>
                    <small v-if="submitted && !educationalProgram" class="p-error">Educational program is required.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label class="z-3" for="course">Course*</label>
                    <InputNumber
                        id="course"
                        fluid
                        v-model="course"
                        allow-empty
                        :format="false"
                        :class="{ 'p-invalid': submitted && !course }"
                        aria-describedby="year-help"/>
                    <small v-if="submitted && !course" class="p-error">Course is required.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label class="z-3" for="year">Year*</label>
                    <InputNumber
                        id="year"
                        fluid
                        v-model="year"
                        allow-empty
                        :format="false"
                        :class="{ 'p-invalid': submitted && !year }"
                        aria-describedby="year-help"/>
                    <small v-if="submitted && !year" class="p-error">Year is required.</small>
                </FloatLabel>

                <div class="d-flex gap-2">
                    <Checkbox v-model="canSelect" binary/>
                    <span>Can select</span>
                </div>

                <FloatLabel variant="over">
                    <label class="z-3" for="semester1MinCredits">Semester 1 minimum credits</label>
                    <InputNumber
                        id="semester1MinCredits"
                        fluid
                        v-model="year"
                        allow-empty
                        :format="false"
                        :class="{ 'p-invalid': submitted && !year }"/>
                    <small v-if="submitted && !year" class="p-error">Year is required.</small>
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
import { defineComponent, ref, onUnmounted, PropType } from 'vue';
import { Subscription } from 'rxjs';
import AdminService from '@/services/admin.service';
import { useToast } from 'primevue/usetoast';
import { UsersApi } from "@/types/api";

export default defineComponent({
    name: 'StudentsDialog',
    props: {
        editData: {
            type: Object as PropType<UsersApi.Admin.EditStudent>,
            required: false,
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
        const semester1MinCredits = ref<number | undefined>();
        const semester1MaxCredits = ref<number | undefined>();
        const semester2MinCredits = ref<number | undefined>();
        const semester2MaxCredits = ref<number | undefined>();
        let wasChanged = false;

        const editProfiles = () => {
            submitted.value = true;

            // Simple validation
            if (semester1MinCredits.value && semester1MaxCredits.value && semester2MinCredits.value &&
                educationalProgram.value && year.value && semester2MaxCredits.value && course.value) {
                const userData = {
                    educationalProgram: educationalProgram.value,
                    course: course.value.toString(),
                    year: year.value.toString(),
                    canSelect: canSelect.value,
                    semester1MinCredits: semester1MinCredits.value,
                    semester1MaxCredits: semester1MaxCredits.value,
                    semester2MinCredits: semester2MinCredits.value,
                    semester2MaxCredits: semester2MaxCredits.value,
                };

                const subscription = AdminService.editStudents(userData).subscribe({
                    next: () => {
                        wasChanged = true;
                        toast.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Profile updated successfully',
                            life: 3000
                        });
                    },
                    error: ({ response } = {}) => {
                        toast.add({
                            severity: 'error',
                            summary: 'Failed to update profile',
                            detail: response?.data.message,
                            life: 5000
                        });
                    },
                });

                subscriptions.add(subscription);
            }
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
        };
    }
});
</script>
