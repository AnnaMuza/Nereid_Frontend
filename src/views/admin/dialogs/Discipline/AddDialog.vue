<template>
    <Card>
        <template #content>
            <div class="d-flex flex-column gap-5 mt-20">
                <FloatLabel variant="over">
                    <label for="lastName">Name*</label>
                    <InputText
                        id="lastName"
                        v-model="name"
                    />
                    <small v-if="submitted && !name.trim()" class="p-error">Name is required.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="firstName" class="z-3">Amount of credits*</label>
                    <InputNumber
                        id="firstName"
                        v-model="credits"
                        aria-describedby="firstName-help"
                        fluid
                    />
                    <small v-if="submitted && !credits" class="p-error">Amount of credits is required.</small>
                </FloatLabel>

                <FloatLabel variant="over">
                    <label for="patronymic" class="z-3">Semester*</label>
                    <Select
                        id="patronymic"
                        v-model="semester"
                        :options="semesterOptions"
                        variant="filled"
                        optionLabel="label"
                        optionValue="value"
                        class="w-50"
                    />
                    <small v-if="submitted && !semester" class="p-error">Semester is required.</small>
                </FloatLabel>
            </div>

            <Button
                class="d-flex mt-4"
                style="justify-self: center;"
                label="Add discipline"
                @click="addDiscipline"/>
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
import { UsersApi } from "@/types/api";

export default defineComponent({
    name: 'AddDisciplineDialog',
    emits: ['reload'],
    setup(props, {emit}) {
        const subscriptions = new Set<Subscription>();
        const toast = useToast();
        const submitted = ref<boolean>(false);
        const semesterOptions = ref([
            { label: '1', value: '1' },
            { label: '2', value: '2' }
        ]);
        const name = ref<string>('');
        const credits = ref<number | null>(null);
        const semester = ref<UsersApi.Admin.Semester | null>(null);

        const addDiscipline = () => {
            submitted.value = true;

            // Simple validation
            if (name.value.trim() && credits.value && semester.value) {
                const userData: UsersApi.Admin.AddDiscipline = {
                    name: name.value.trim(),
                    credits: credits.value,
                    semester: semester.value,
                };

                const subscription = AdminService.addDiscipline(userData).subscribe({
                    next: () => {
                        emit('reload');
                        toast.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Discipline created successfully',
                            life: 5000
                        });
                    },
                    error: ({ response } = {}) => {
                        toast.add({
                            severity: 'error',
                            summary: 'Failed to create discipline',
                            detail: response?.data.message,
                            life: 5000
                        });
                    },
                });

                subscriptions.add(subscription);
            }
        };

        onUnmounted(() => {
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            name,
            semester,
            credits,
            submitted,
            semesterOptions,
            addDiscipline,
        };
    }
});
</script>
