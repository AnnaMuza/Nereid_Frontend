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
        v-model:visible="editStudentsDialog">
        <StudentsDialog :student-ids="selectedStudents.map((s) => s.id)" @reload="loadStudents"/>
        <template #header>
            <CardHeader icon="user-edit" title="Edit students"/>
        </template>
    </Dialog>

    <Dialog
        modal
        :draggable="false"
        class="w-75"
        v-model:visible="addStudentDialog">
        <StudentDialog @reload="loadStudents(); addStudentDialog = false"/>
        <template #header>
            <CardHeader icon="user-plus" title="Add student"/>
        </template>
    </Dialog>

    <Dialog
        modal
        :draggable="false"
        class="w-50"
        v-model:visible="uploadCsvDialog">
        <template #header>
            <CardHeader icon="file-import" title="Upload Students CSV"/>
        </template>
        <div class="p-fluid">
            <div class="d-flex flex-column gap-2">
                <div>
                    <Button
                        :label="csvFile ? csvFile.name : 'Choose File'"
                        icon="pi pi-file"
                        @click="$refs.fileInput.click()"
                        class="w-full text-left justify-content-start"
                    />
                    <input
                        ref="fileInput"
                        type="file"
                        accept=".csv"
                        @change="handleFileSelect"
                        style="display: none"
                    />
                </div>
                <small v-if="csvFile" class="text-success">File selected: {{ csvFile.name }}</small>
                <small v-else>Please select a CSV file with student data</small>
            </div>

            <div v-if="csvUploadError" class="my-3">
                <Message severity="error">{{ csvUploadError }}</Message>
            </div>

            <div class="d-flex gap-3 mt-4">
                <Button
                    label="Cancel"
                    severity="secondary"
                    icon="pi pi-times"
                    @click="cancelCsvUpload"
                />
                <Button
                    label="Upload"
                    icon="pi pi-upload"
                    :disabled="!csvFile || csvUploading"
                    :loading="csvUploading"
                    @click="uploadStudentsCSV"
                />
            </div>
        </div>
    </Dialog>

    <Card>
        <template #header>
            <CardHeader icon="users" title="Students" />
        </template>

        <template #content>
            <div class="d-flex gap-3 mt-2 justify-content-center">
                <SplitButton label="Add Student"
                             @click="addStudentDialog = true"
                             icon="pi pi-plus"
                             severity="info"
                             rounded
                             :model="items"/>

                <Button
                    :label="selectedStudents.length > 1 ? 'Edit Students' : 'Edit Student&nbsp;&nbsp;'"
                    @click="editSelectedStudents"
                    icon="pi pi-pencil"
                    :disabled="!selectedStudents || selectedStudents.length === 0"
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
import StudentDialog from "@/views/admin/dialogs/StudentDialog.vue";
import StudentsDialog from "@/views/admin/dialogs/StudentsDialog.vue";
import UtilsService from "@/services/utils.service";
import { AxiosError } from "axios";
import { AxiosErrorData } from "@/types/global.interface";

export default defineComponent({
    name: 'StudentsTable',
    components: {
        StudentDialog,
        StudentsDialog,
    },
    setup() {
        const toast = useToast();
        const subscriptions = new Set<Subscription>();
        const students = ref<UsersApi.Admin.Student[]>([]);
        const selectedStudents = ref<UsersApi.Admin.Student[]>([]);
        const addStudentDialog = ref(false);
        const editStudentDialog = ref(false);
        const editStudentsDialog = ref(false);
        const uploadCsvDialog = ref(false);
        const csvFile = ref<File | null>(null);
        const csvUploading = ref(false);
        const csvUploadError = ref('');
        const fileInput = ref(null);
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

        const items = ref([
            {
                label: 'Upload CSV with students',
                icon: 'pi pi-file-plus',
                command: () => {
                    uploadCsvDialog.value = true;
                }
            },
            {
                label: 'Download template',
                icon: 'pi pi-table',
                command: () => {
                    getStudentsCsvTemplate();
                }
            },
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
            canSelect: false,
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

        const editSelectedStudents = () => {
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
                    canSelect: student.canSelect,
                };
                editStudentDialog.value = true;
            }
            else if (selectedStudents.value.length > 1) {
                editStudentsDialog.value = true;
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

        const getStudentsCsvTemplate = () => {
            const subscription = AdminService.getStudentsCsvTemplate().subscribe({
                next: ({ csvText }) => {
                    UtilsService.downloadCsv(csvText, 'students_template.csv');
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

        const handleFileSelect = (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const file = target.files[0];
                if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                    csvFile.value = file;
                    csvUploadError.value = '';
                } else {
                    csvUploadError.value = 'Please select a valid CSV file';
                    csvFile.value = null;
                }
            }
        };

        const cancelCsvUpload = () => {
            csvFile.value = null;
            csvUploadError.value = '';
            uploadCsvDialog.value = false;
            if (fileInput.value) {
                (fileInput.value as HTMLInputElement).value = '';
            }
        };

        const uploadStudentsCSV = async () => {
            if (!csvFile.value) {
                csvUploadError.value = 'Please select a CSV file to upload';
                return;
            }

            try {
                csvUploading.value = true;
                const csvText = await UtilsService.readCSVFile(csvFile.value);

                const subscription = AdminService.addStudentsWithCsv({ csvText }).subscribe({
                    next: () => {
                        toast.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Students uploaded successfully',
                            life: 3000
                        });
                        cancelCsvUpload();
                        loadStudents();
                        csvUploading.value = false;
                    },
                    error: (err: AxiosError<AxiosErrorData>) => {
                        csvUploadError.value = err.response?.data.message || 'Failed to upload students';
                        toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: csvUploadError.value,
                            life: 3000
                        });
                        csvUploading.value = false;
                    }
                });
                subscriptions.add(subscription);
            } catch (error) {
                csvUploadError.value = 'Error reading CSV file';
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error reading CSV file',
                    life: 3000
                });
                csvUploading.value = false;
            }
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
            editStudentsDialog,
            editedStudent,
            filters,
            markStudentsActive,
            initFilters,
            loading,
            statusOptions,
            loadStudents,
            editSelectedStudents,
            selectOptions,
            getStudentsCsvTemplate,
            items,
            uploadCsvDialog,
            csvFile,
            csvUploading,
            csvUploadError,
            fileInput,
            handleFileSelect,
            cancelCsvUpload,
            uploadStudentsCSV
        };
    }
});
</script>
