<template>
    <ConfirmDialog></ConfirmDialog>

    <Dialog
        modal
        :draggable="false"
        class="w-75"
        v-model:visible="editDisciplineDialog">
        <EditDisciplineDialog :discipline-id="editedDiscipline?.id"/>
        <template #header>
            <CardHeader icon="file-edit" :title="editedDiscipline?.name"/>
        </template>
    </Dialog>

    <Dialog
        modal
        :draggable="false"
        class="w-50"
        v-model:visible="addDisciplineDialog">
        <AddDisciplineDialog @reload="loadDisciplines(); addDisciplineDialog = false"/>
        <template #header>
            <CardHeader icon="file-plus" title="Add discipline"/>
        </template>
    </Dialog>

    <Card>
        <template #header>
            <CardHeader icon="book" title="Disciplines" />
        </template>

        <template #content>
            <div class="d-flex gap-3 mt-2 justify-content-center">
                <Button
                    label="Add Discipline"
                    @click="addDisciplineDialog = true"
                    icon="pi pi-plus"
                    severity="info"
                    class="p-button-rounded"
                />

                <Button
                    label="View Discipline"
                    @click="editSelectedDiscipline"
                    icon="pi pi-arrow-up-right"
                    :disabled="!selectedDisciplines || selectedDisciplines.length !== 1"
                    class="p-button-rounded"
                />

                <Button
                    label="Delete Disciplines"
                    @click="confirmDelete"
                    icon="pi pi-trash"
                    severity="danger"
                    :disabled="!selectedDisciplines || selectedDisciplines.length === 0"
                    class="p-button-rounded"
                />

                <Divider layout="vertical"/>

                <Button
                    label="Mark Active"
                    @click="markDisciplinesActive(true)"
                    :disabled="!selectedDisciplines || selectedDisciplines.length === 0"
                    icon="pi pi-check"
                    severity="success"
                    class="p-button-rounded"
                />

                <Button
                    label="Mark Inactive"
                    @click="markDisciplinesActive(false)"
                    :disabled="!selectedDisciplines || selectedDisciplines.length === 0"
                    icon="pi pi-times"
                    severity="danger"
                    class="p-button-rounded"
                />
            </div>

            <Divider class="mt-4"/>

            <DataTable
                v-model:selection="selectedDisciplines"
                :value="disciplines"
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
                <template #empty>No disciplines found</template>
                <template #loading>Loading disciplines data. Please wait</template>

                <Column selectionMode="multiple"></Column>

                <Column field="name" header="Name" sortable>
                    <template #body="{ data }">
                        {{ data.name }}
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText
                            v-model="filterModel.value"
                            type="text"
                            @input="filterCallback()"
                            class="p-column-filter w-100"
                            placeholder="Search by name"
                        />
                    </template>
                </Column>

                <Column field="credits" header="Credits" sortable>
                    <template #body="{ data }">
                        {{ data.credits }}
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText
                            v-model="filterModel.value"
                            type="text"
                            @input="filterCallback()"
                            class="p-column-filter w-100"
                            placeholder="Search by credits"
                        />
                    </template>
                </Column>

                <Column field="semester" header="Semester">
                    <template #body="{ data }">
                        {{ data.semester }}
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <Select
                            v-model="filterModel.value"
                            @change="filterCallback()"
                            :options="semesterOptions"
                            variant="filled"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Semester"
                            class="w-100"
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
import AddDisciplineDialog from "@/views/admin/dialogs/Discipline/AddDialog.vue";
import EditDisciplineDialog from "@/views/admin/dialogs/Discipline/EditDialog.vue";
import { useConfirm } from "primevue/useconfirm";
import TeacherService from "@/services/teacher.service";

export default defineComponent({
    name: 'DisciplinesTable',
    components: {
        AddDisciplineDialog,
        EditDisciplineDialog,
    },
    setup() {
        const toast = useToast();
        const disciplines = ref<UsersApi.Admin.Discipline[]>([]);
        const selectedDisciplines = ref<UsersApi.Admin.Discipline[]>([]);
        const subscriptions = new Set<Subscription>();
        const addDisciplineDialog = ref(false);
        const editDisciplineDialog = ref(false);
        const editedDiscipline = ref<UsersApi.Admin.Discipline | null>(null);
        const filters = ref();
        const confirm = useConfirm();
        const loading = ref<boolean>(true);
        const statusOptions = ref([
            { label: 'Active', value: true },
            { label: 'Inactive', value: false }
        ]);
        const semesterOptions = ref([
            { label: '1', value: '1' },
            { label: '2', value: '2' }
        ]);

        const initFilters = () => {
            filters.value = {
                global: {value: null, matchMode: FilterMatchMode.CONTAINS},
                name: {value: null, matchMode: FilterMatchMode.STARTS_WITH},
                credits: {value: null, matchMode: FilterMatchMode.EQUALS},
                semester: {value: null, matchMode: FilterMatchMode.EQUALS},
                isActive: {value: null, matchMode: FilterMatchMode.EQUALS},
            };
        };
        initFilters();

        const confirmDelete = () => {
            confirm.require({
                message: `Are you sure you want to delete selected disciplines?`,
                header: 'Confirmation',
                icon: 'pi pi-exclamation-triangle',
                rejectProps: {
                    label: 'Cancel',
                    severity: 'secondary',
                },
                acceptProps: {
                    label: 'Delete',
                    severity: 'danger',
                },
                accept: () => {
                    deleteSelectedDisciplines();
                },
                reject: () => {}
            });
        };

        const loadDisciplines = () => {
            const subscription = AdminService.getAllDisciplines().subscribe({
                next: (response) => {
                    disciplines.value = response;
                    selectedDisciplines.value = [];
                    loading.value = false;
                },
                error: () => {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load disciplines',
                        life: 3000
                    });
                    loading.value = false;
                }
            });
            subscriptions.add(subscription);
        };

        const editSelectedDiscipline = () => {
            if (selectedDisciplines.value.length === 1) {
                const d = selectedDisciplines.value[0];
                editedDiscipline.value = { ...d };
                editDisciplineDialog.value = true;
            }
        };

        const deleteSelectedDisciplines = () => {
            if (selectedDisciplines.value.length === 0) return;

            loading.value = true;

            // Track how many operations are completed
            let completedOps = 0;
            const totalOps = selectedDisciplines.value.length;

            selectedDisciplines.value.forEach(d => {
                const subscription = AdminService.deleteDiscipline(d.id).subscribe({
                    next: () => {
                        completedOps++;
                        if (completedOps === totalOps) {
                            selectedDisciplines.value = [];
                            loading.value = false;
                            loadDisciplines();
                        }
                    },
                    error: ({ response } = {}) => {
                        toast.add({
                            severity: 'error',
                            summary: 'Failed to delete discipline',
                            detail: response?.data.message,
                            life: 5000
                        });
                        loading.value = false;
                    },
                });

                subscriptions.add(subscription);
            });
        };

        const markDisciplinesActive = (isActive: boolean) => {
            if (selectedDisciplines.value.length < 1) { return; }
            const disciplineIds = selectedDisciplines.value.map((d) => d.id);

            const subscription = AdminService.editDisciplines({ disciplineIds, isActive }).subscribe({
                next: () => {
                    toast.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Successfully marked ${selectedDisciplines.value.length} discipline(s) as ${isActive ? 'active' : 'inactive'}`,
                        life: 3000
                    });
                    loadDisciplines();
                },
                error: () => {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update some disciplines',
                        life: 3000
                    });
                    loadDisciplines();
                },
            });
            subscriptions.add(subscription);
        };

        onMounted(() => {
            loadDisciplines();
        });

        onUnmounted(() => {
            // Clean up all subscriptions to prevent memory leaks
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.clear();
        });

        return {
            disciplines,
            selectedDisciplines,
            addDisciplineDialog,
            editDisciplineDialog,
            filters,
            markDisciplinesActive,
            initFilters,
            loading,
            statusOptions,
            loadDisciplines,
            editSelectedDiscipline,
            semesterOptions,
            editedDiscipline,
            confirmDelete,
        };
    }
});
</script>
