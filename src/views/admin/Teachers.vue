<template>
    <Dialog
        modal
        :draggable="false"
        class="w-75"
        v-model:visible="editTeacherDialog">
        <TeacherDialog :edit-data="editedTeacher" @reload="loadTeachers"/>
        <template #header>
            <CardHeader icon="user-edit" title="Edit teacher"/>
        </template>
    </Dialog>

    <Dialog
        modal
        :draggable="false"
        class="w-75"
        v-model:visible="addTeacherDialog">
        <TeacherDialog @reload="loadTeachers"/>
        <template #header>
            <CardHeader icon="user-plus" title="Add teacher"/>
        </template>
    </Dialog>

    <Card>
        <template #header>
            <CardHeader icon="user-edit" title="Teachers" />
        </template>

        <template #content>
            <div class="d-flex gap-3 mt-2 justify-content-center">
                <Button
                    label="Add Teacher"
                    @click="addTeacherDialog = true"
                    icon="pi pi-plus"
                    severity="info"
                    class="p-button-rounded"
                />

                <Button
                    label="Edit Teacher"
                    @click="editSelectedTeacher"
                    icon="pi pi-pencil"
                    :disabled="!selectedTeachers || selectedTeachers.length !== 1"
                    class="p-button-rounded"
                />

                <Button
                    label="Mark Active"
                    @click="markTeachersActive(true)"
                    :disabled="!selectedTeachers || selectedTeachers.length === 0"
                    icon="pi pi-check"
                    severity="success"
                    class="p-button-rounded"
                />

                <Button
                    label="Mark Inactive"
                    @click="markTeachersActive(false)"
                    :disabled="!selectedTeachers || selectedTeachers.length === 0"
                    icon="pi pi-times"
                    severity="danger"
                    class="p-button-rounded"
                />
            </div>

            <Divider class="mt-4"/>

            <DataTable
                v-model:selection="selectedTeachers"
                :value="teachers"
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
                            class="w-100"
                        />
                    </template>
                </Column>
            </DataTable>
        </template>
    </Card>
</template>

<style lang="scss" scoped>

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
import TeacherDialog from "@/views/admin/dialogs/TeacherDialog.vue";

export default defineComponent({
    name: 'TeachersTable',
    components: { TeacherDialog },
    setup() {
        const toast = useToast();
        const subscriptions = new Set<Subscription>();
        const teachers = ref<UsersApi.Admin.Teacher[]>([]);
        const selectedTeachers = ref<UsersApi.Admin.Teacher[]>([]);
        const addTeacherDialog = ref(false);
        const editTeacherDialog = ref(false);
        const filters = ref();
        const loading = ref<boolean>(true);
        const statusOptions = ref([
            { label: 'Active', value: true },
            { label: 'Inactive', value: false }
        ]);

        const initFilters = () => {
            filters.value = {
                global: {value: null, matchMode: FilterMatchMode.CONTAINS},
                firstName: {value: null, matchMode: FilterMatchMode.STARTS_WITH},
                lastName: {value: null, matchMode: FilterMatchMode.STARTS_WITH},
                email: {value: null, matchMode: FilterMatchMode.CONTAINS},
                isActive: {value: null, matchMode: FilterMatchMode.EQUALS},
            };
        };
        initFilters();

        const editedTeacher = ref<UsersApi.Admin.EditTeacher>({
            id: 0,
            email: '',
            firstName: '',
            lastName: '',
            patronymic: '',
            isActive: true,
        });

        const loadTeachers = () => {
            const subscription = AdminService.getAllTeachers().subscribe({
                next: (response) => {
                    teachers.value = response;
                    selectedTeachers.value = [];
                    loading.value = false;
                },
                error: () => {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load teachers',
                        life: 3000
                    });
                    loading.value = false;
                }
            });
            subscriptions.add(subscription);
        };

        const editSelectedTeacher = () => {
            if (selectedTeachers.value.length === 1) {
                const teacher = selectedTeachers.value[0];
                editedTeacher.value = {
                    id: teacher.id,
                    email: teacher.email,
                    firstName: teacher.firstName,
                    lastName: teacher.lastName,
                    patronymic: teacher.patronymic,
                    isActive: teacher.isActive,
                };
                editTeacherDialog.value = true;
            }
        };

        const markTeachersActive = (isActive: boolean) => {
            if (selectedTeachers.value.length < 1) { return; }
            const studentIds = selectedTeachers.value.map((student) => student.id);

            // const subscription = AdminService.editStudents({ studentIds, isActive }).subscribe({
            //     next: () => {
            //         toast.add({
            //             severity: 'success',
            //             summary: 'Success',
            //             detail: `Successfully marked ${selectedStudents.value.length} student(s) as ${isActive ? 'active' : 'inactive'}`,
            //             life: 3000
            //         });
            //         loadStudents();
            //     },
            //     error: () => {
            //         toast.add({
            //             severity: 'error',
            //             summary: 'Error',
            //             detail: 'Failed to update some students',
            //             life: 3000
            //         });
            //         loadStudents();
            //     },
            // });
            // subscriptions.add(subscription);
        };

        onMounted(() => {
            loadTeachers();
        });

        onUnmounted(() => {
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            teachers,
            selectedTeachers,
            addTeacherDialog,
            editTeacherDialog,
            editedTeacher,
            filters,
            markTeachersActive,
            initFilters,
            loading,
            statusOptions,
            loadTeachers,
            editSelectedTeacher,
        };
    }
});
</script>
