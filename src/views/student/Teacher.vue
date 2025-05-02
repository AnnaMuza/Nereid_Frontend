<template>

<Card>
    <template #content>
        <div class="d-flex flex-column gap-5 mt-5">
            <FloatLabel variant="over">
                <label for="firstName">First Name</label>
                <InputText
                    id="firstName"
                    v-model="disciplineForm.firstName"
                    aria-describedby="firstName-help"
                />
            </FloatLabel>

            <FloatLabel variant="over">
                <label for="lastName">Last Name</label>
                <InputText
                    id="lastName"
                    v-model="disciplineForm.lastName"
                    aria-describedby="lastName-help"
                />
            </FloatLabel>

            <FloatLabel variant="over">
                <label for="patronymic">Patronymic</label>
                <InputText
                    id="patronymic"
                    v-model="disciplineForm.patronymic"
                    aria-describedby="patronymic-help"
                />
            </FloatLabel>

            <FloatLabel variant="over">
                <label for="email">Email</label>
                <InputText
                    id="email"
                    v-model="disciplineForm.email"
                    aria-describedby="email-help"
                />
            </FloatLabel>
        </div>

        <Divider v-if="fields.length" class="my-5"/>

        <div class="d-flex flex-column">
            <div class="d-flex flex-column gap-3">
                <div v-for="field in fields" :key="field.id" class="d-flex align-items-center gap-3">
                    <div class="flex-grow-1">
                        <small style="padding-left: 0.75rem">{{ field.name }}</small>
                        <Message class="mt-1" v-if="UtilsService.isURL(field.content)"><a :href="field.content" target="_blank">{{ field.content }}</a></Message>
                        <Message v-else class="mt-1">{{ field.content }}</Message>
                    </div>
                </div>
            </div>
        </div>
    </template>
</Card>

</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue';
import { Subscription } from "rxjs";
import StudentService from "@/services/student.service";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { UtilsService } from "@/services";

export default defineComponent({
    name: 'Teacher',
    props: {
        disciplineId: {
            type: Number,
            required: false
        }
    },
    setup(props) {
        const toast = useToast();
        const route = useRoute();
        const id = props.disciplineId || Number(route.params.id);
        const loading = ref(false);
        const fields = ref<any[]>([]);
        const subscriptions = new Set<Subscription>();

        const disciplineForm = reactive({
            firstName: '',
            lastName: '',
            patronymic: '',
            email: '',
        });

        const fetchTeacher = () => {
            const subscription = StudentService.getTeacher(id).subscribe({
                next: (response) => {
                    disciplineForm.firstName = response.teacher.firstName;
                    disciplineForm.lastName = response.teacher.lastName;
                    disciplineForm.patronymic = response.teacher.patronymic;
                    disciplineForm.email = response.teacher.email;
                    fields.value = response.teacherFields;
                    loading.value = false;
                },
                error: ({ response } = {}) => {
                    toast.add({
                        severity: 'error',
                        summary: 'Failed to load teacher data',
                        detail: response?.data.message,
                        life: 5000
                    });
                    loading.value = false;
                },
            });

            subscriptions.add(subscription);
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
            fields,
            fetchTeacher,
            disciplineForm,
            UtilsService,
        };
    }
});
</script>
