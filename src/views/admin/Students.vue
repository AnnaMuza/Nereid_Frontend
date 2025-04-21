<template>
    <Dialog
        modal
        :draggable="false"
        class="w-75"
        v-model:visible="editStudentDialog">
        <StudentDialog :edit-data="editedStudent" @reload="loadStudents"/>
        <template #header>
            <CardHeader icon="user-edit" title="Edit student"/>
        </template>
    </Dialog>

    <Dialog
        modal
        :draggable="false"
        class="w-75"
        v-model:visible="addStudentDialog">
        <StudentDialog @reload="loadStudents"/>
        <template #header>
            <CardHeader icon="user-plus" title="Add student"/>
        </template>
    </Dialog>

    <Card>
        <template #header>
            <CardHeader icon="users" title="Students" />
        </template>

        <template #content>
            <div class="d-flex gap-3 mt-2 justify-content-center">
                <Button
                    label="Add Student"
                    @click="addStudentDialog = true"
                    icon="pi pi-plus"
                    severity="info"
                    class="p-button-rounded"
                />

                <Button
                    label="Edit Student"
                    @click="editSelectedStudent"
                    icon="pi pi-pencil"
                    :disabled="!selectedStudents || selectedStudents.length !== 1"
                    class="p-button-rounded"
                />

                <Button
                    label="Mark Active"
                    @click="markStudentsActive(true)"
                    :disabled="!selectedStudents || selectedStudents.length === 0"
                    icon="pi pi-check"
                    severity="success"
                    class="p-button-rounded"
                />

                <Button
                    label="Mark Inactive"
                    @click="markStudentsActive(false)"
                    :disabled="!selectedStudents || selectedStudents.length === 0"
                    icon="pi pi-times"
                    severity="danger"
                    class="p-button-rounded"
                />
            </div>

            <Divider class="mt-4"/>

            <DataTable
                v-model:selection="selectedStudents"
                :value="students"
                v-model:filters="filters"
                filterDisplay="row"
                paginator
                removableSort
                :rowsPerPageOptions="[5, 15, 20, 40, 50]"
                :rows="15"
                dataKey="id"
                :loading="loading"
                stripedRows
            >
                <template #header>
                    <div class="d-flex gap-3 justify-content-end">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        </IconField>
                        <Button type="button" icon="pi pi-filter-slash" label="Clear all" severity="secondary" @click="initFilters"/>
                    </div>
                </template>
                <template #empty>No students found</template>
                <template #loading>Loading students data. Please wait</template>

                <Column selectionMode="multiple"></Column>

                <Column field="firstName" header="First Name" sortable>
                    <template #body="{ data }">
                        {{ data.firstName }}
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText
                            v-model="filterModel.value"
                            type="text"
                            @input="filterCallback()"
                            class="p-column-filter w-100"
                            placeholder="Search by first name"
                        />
                    </template>
                </Column>

                <Column field="lastName" header="Last Name" sortable>
                    <template #body="{ data }">
                        {{ data.lastName }}
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText
                            v-model="filterModel.value"
                            type="text"
                            @input="filterCallback()"
                            class="p-column-filter w-100"
                            placeholder="Search by last name"
                        />
                    </template>
                </Column>

                <Column field="email" header="Email">
                    <template #body="{ data }">
                        {{ data.email }}
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText
                            v-model="filterModel.value"
                            type="text"
                            @input="filterCallback()"
                            class="p-column-filter w-100"
                            placeholder="Search by email"
                        />
                    </template>
                </Column>

                <Column field="educationalProgram" header="Educational Program">
                    <template #body="{ data }">
                        {{ data.educationalProgram }}
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText
                            v-model="filterModel.value"
                            type="text"
                            @input="filterCallback()"
                            class="p-column-filter w-100"
                            placeholder="Search by program"
                        />
                    </template>
                </Column>

                <Column field="year" header="Year">
                    <template #body="{ data }">
                        {{ data.year }}
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText
                            v-model="filterModel.value"
                            type="text"
                            @input="filterCallback()"
                            class="p-column-filter w-100"
                            placeholder="Search by year"
                        />
                    </template>
                </Column>

                <Column field="isActive" header="Is Active" dataType="boolean">
                    <template #body="{ data }">
                        <Badge
                            :value="data.isActive ? 'Active' : 'Inactive'"
                            :severity="data.isActive ? 'success' : 'danger'"
                        />
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <Select
                            v-model="filterModel.value"
                            @change="filterCallback()"
                            :options="statusOptions"
                            variant="filled"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Status"
                            class="p-column-filter w-100"
                        />
                    </template>
                </Column>

                <Column field="canSelect" header="Can Select" dataType="boolean">
                    <template #body="{ data }">
                        <Badge
                            :value="data.canSelect ? 'Yes' : 'No'"
                            :severity="data.canSelect ? 'info' : 'contrast'"
                        />
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <Select
                            v-model="filterModel.value"
                            @change="filterCallback()"
                            :options="selectOptions"
                            variant="filled"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Status"
                            class="p-column-filter w-100"
                        />
                    </template>
                </Column>
            </DataTable>
        </template>
    </Card>
</template>

<style lang="scss" scoped>

.p-column-filter {
    width: 100%;
}

.p-datatable {
    .p-datatable-filter {
        .p-inputtext {
            padding-block: revert-layer;
        }
    }
}

</style>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { Subscription } from 'rxjs';
import AdminService from '@/services/admin.service';
import { useToast } from 'primevue/usetoast';
import { UsersApi } from "@/types/api";
import { FilterMatchMode } from '@primevue/core/api';
import StudentDialog from "@/views/admin/dialogs/StudentDialog.vue";

export default defineComponent({
    name: 'StudentsTable',
    components: { StudentDialog },
    setup() {
        const toast = useToast();
        const subscriptions = new Set<Subscription>();
        const students = ref<UsersApi.Admin.Student[]>([]);
        const selectedStudents = ref<UsersApi.Admin.Student[]>([]);
        const addStudentDialog = ref(false);
        const editStudentDialog = ref(false);
        const filters = ref();
        const loading = ref<boolean>(true);
        const statusOptions = ref([
            { label: 'Active', value: true },
            { label: 'Inactive', value: false }
        ]);
        const selectOptions = ref([
            { label: 'Yes', value: true },
            { label: 'No', value: false }
        ]);

        const initFilters = () => {
            filters.value = {
                global: {value: null, matchMode: FilterMatchMode.CONTAINS},
                firstName: {value: null, matchMode: FilterMatchMode.STARTS_WITH},
                lastName: {value: null, matchMode: FilterMatchMode.STARTS_WITH},
                email: {value: null, matchMode: FilterMatchMode.CONTAINS},
                educationalProgram: {value: null, matchMode: FilterMatchMode.CONTAINS},
                year: {value: null, matchMode: FilterMatchMode.EQUALS},
                isActive: {value: null, matchMode: FilterMatchMode.EQUALS},
                canSelect: {value: null, matchMode: FilterMatchMode.EQUALS},
            };
        };
        initFilters();

        const editedStudent = ref<UsersApi.Admin.EditStudent>({
            id: 0,
            email: '',
            firstName: '',
            lastName: '',
            patronymic: '',
            educationalProgram: '',
            course: '',
            year: '',
            isActive: true
        });

        const loadStudents = () => {
            const subscription = AdminService.getAllStudents().subscribe({
                next: (response) => {
                    students.value = response;
                    selectedStudents.value = [];
                    loading.value = false;
                },
                error: () => {
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

        const editSelectedStudent = () => {
            if (selectedStudents.value.length === 1) {
                const student = selectedStudents.value[0];
                editedStudent.value = {
                    id: student.id,
                    email: student.email,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    patronymic: student.patronymic,
                    educationalProgram: student.educationalProgram,
                    course: student.course,
                    year: student.year,
                    isActive: student.isActive
                };
                editStudentDialog.value = true;
            }
        };

        const markStudentsActive = (isActive: boolean) => {
            if (selectedStudents.value.length < 1) { return; }
            const studentIds = selectedStudents.value.map((student) => student.id);

            const subscription = AdminService.editStudents({ studentIds, isActive }).subscribe({
                next: () => {
                    toast.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Successfully marked ${selectedStudents.value.length} student(s) as ${isActive ? 'active' : 'inactive'}`,
                        life: 3000
                    });
                    loadStudents();
                },
                error: () => {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update some students',
                        life: 3000
                    });
                    loadStudents();
                },
            });
            subscriptions.add(subscription);
        };

        onMounted(() => {
            loadStudents();
        });

        onUnmounted(() => {
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            students,
            selectedStudents,
            addStudentDialog,
            editStudentDialog,
            editedStudent,
            filters,
            markStudentsActive,
            initFilters,
            loading,
            statusOptions,
            loadStudents,
            editSelectedStudent,
            selectOptions,
        };
    }
});
</script>
