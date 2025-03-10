<template>
    <div class="login-bg-image d-flex flex-column align-items-center justify-content-center w-100 h-100">
        <div class="login-wrapper rounded-5 d-flex flex-column align-items-center bg-white p-5">
            <p class="fw-bold fs-2 text-dark">Welcome to Nereid</p>
            <Toast />
            <Form v-slot="$form" :initialValues="initialValues" :resolver="resolver" @submit="onFormSubmit" class="w-100">
                <div class="flex flex-col gap-2">
                    <IconField class="mb-2">
                        <InputIcon class="fi fi-rr-user"/>
                        <InputText name="email" type="email" placeholder="Nickname" variant="filled" size="large" class="rounded-3 border-0 w-100" fluid />
                    </IconField>
                    <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
                </div>

                <div class="flex flex-col gap-2">
                    <IconField class="mb-2">
                        <InputIcon class="fi fi-rr-lock z-3"/>
                        <Password name="password" placeholder="Password" variant="filled" size="large" :feedback="false" toggleMask class="rounded-3 border-0 w-100" fluid />
                    </IconField>
                    <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{ $form.password.error?.message }}</Message>
                </div>

                <div class="mb-3">
                    <Checkbox name="rememberMe" inputId="rememberMe"/>
                    <label for="rememberMe" class="ml-2">Remember Me</label>
                </div>

                <Button type="submit" class="w-100 rounded-3 mt-3 fw-bold" label="Login" size="large"/>
            </Form>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.login-bg-image {
    background-image: url("https://scontent-iev1-1.xx.fbcdn.net/v/t39.30808-6/473070276_1123357233125985_3642752495015117770_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=8Q83SkUxJQMQ7kNvgHEfqly&_nc_oc=Adg8lvNNXOIhE3ZlZn2KPyfCDTPi9Qt9mGUF6aGiisOB7cOGbp-dyZR0i-4Zr53WF5I&_nc_zt=23&_nc_ht=scontent-iev1-1.xx&_nc_gid=AN8apkKalRXRiLqmP7BOscd&oh=00_AYHpSFrWJWNPyNuNaFd24R0Mp1FGo6UCvpBivoKzhgTaig&oe=67D3FB6F");
    background-position: left;
    background-repeat: no-repeat;
    background-size: contain;
}

.login-wrapper {
    position: absolute;
    //right: 30%;

    ::v-deep(.field) {
        margin-bottom: 15px;
    }

    ::v-deep(.p-inputtext) {
        width: 380px;

        &.p-password-input {
            padding-inline-start: calc((var(--p-form-field-padding-x) * 2) + var(--p-icon-size));
        }
    }
}
</style>

<script setup lang="ts">
import { reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import { Form, FormResolverOptions, FormSubmitEvent } from '@primevue/forms';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Password from 'primevue/password';
import Message from 'primevue/message';
import Checkbox from 'primevue/checkbox';
import AuthService from '../services/auth.service';
import { router } from '@/router';

// Define types for form values and error messages
interface FormValues {
    email: string;
    password: string;
    rememberMe: boolean;
}

interface FormErrors {
    email?: Array<{ message: string }>;
    password?: Array<{ message: string }>;
    rememberMe?: Array<{ message: string }>;
}

interface LoginResponse {
    response?: {
        data?: {
            message?: string;
        }
    }
}

const toast = useToast();

const initialValues = reactive<FormValues>({
    email: '',
    password: '',
    rememberMe: false
});

const resolver = ({ values }: FormResolverOptions) => {
    const errors: FormErrors = {};

    if (!values.email) {
        errors.email = [{ message: 'Email is required.' }];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = [{ message: 'Please enter a valid email address.' }];
    }

    if (!values.password) {
        errors.password = [{ message: 'Password is required.' }];
    }

    return {
        values,
        errors
    };
};

const onFormSubmit = ({ valid, values }: FormSubmitEvent): void => {
    if (valid) {
        const { email, password, rememberMe } = values;

        AuthService.login({
            email,
            password
        }, rememberMe).subscribe({
            next: () => {
                const { redirectTo = '' } = router.currentRoute.value.query;
                router.push(redirectTo ? { path: redirectTo.toString() } : { path: '/' });
            },
            error: ({ response }: LoginResponse = {}) => {
                const { message = 'Login failed' } = response?.data || {};
                toast.add({ severity: 'error', summary: message, life: 5000 });
            }
        });
    }
};
</script>
