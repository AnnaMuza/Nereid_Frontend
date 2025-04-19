<template>
    <div class="login-bg-image d-flex flex-column align-items-center justify-content-center w-100 h-100">
        <div class="login-wrapper rounded-5 d-flex flex-column align-items-center bg-white p-5">
            <p class="fw-bold fs-2 text-dark">Welcome to Nereid</p>
            <Toast />
            <Form v-slot="$form" :initialValues="initialValues" :resolver="resolver" @submit="onFormSubmit" class="w-100">
                <div class="flex flex-col gap-2">
                    <IconField>
                        <InputIcon class="fi fi-rr-user"/>
                        <InputText name="email" type="email" placeholder="Email" variant="filled" size="large" class="rounded-3 border-0 w-100" fluid />
                    </IconField>
                    <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
                </div>

                <div class="flex flex-col gap-2">
                    <IconField>
                        <InputIcon class="fi fi-rr-lock z-3"/>
                        <Password name="password" placeholder="Password" variant="filled" size="large" :feedback="false" toggleMask class="border-0 w-100" fluid />
                    </IconField>
                    <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{ $form.password.error?.message }}</Message>
                </div>

                <div>
                    <Checkbox inputId="rememberMe" name="rememberMe" value="true"/>
                    <label for="rememberMe" class="ms-2">Remember Me</label>
                </div>

                <Button type="submit" class="w-100 rounded-3 mt-4 fw-bold" label="Login" size="large"/>
            </Form>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.login-bg-image {
    background-image: url(@/assets/images/login-bg.jpg);
    background-position: left;
    background-repeat: no-repeat;
    background-size: contain;
}

.login-wrapper {
    position: absolute;
    right: 28%;

    .p-form {
        > div {
            margin-bottom: 15px;
        }
    }

    ::v-deep(.p-inputtext) {
        width: 380px;

        &.p-password-input {
            border-radius: var(--bs-border-radius-lg);
            padding-inline-start: calc((var(--p-form-field-padding-x) * 2) + var(--p-icon-size));
        }
    }
}
</style>

<script setup lang="ts">
import { reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import { Form, FormResolverOptions, FormSubmitEvent } from '@primevue/forms';
import AuthService from '../services/user.service';
import { router } from '@/router';

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
        }, !!rememberMe[0]).subscribe({
            next: () => {
                const { redirectTo = '' } = router.currentRoute.value.query;
                router.push(redirectTo ? { path: redirectTo.toString() } : { path: '/' });
            },
            error: ({ response } = {}) => {
                const { message = 'Login failed' } = response?.data || {};
                toast.add({ severity: 'error', summary: message, life: 5000 });
            }
        });
    }
};
</script>
