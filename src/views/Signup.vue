<template>
    <div class="login-bg-image d-flex flex-column align-items-center justify-content-center w-100 h-100">
        <div class="login-wrapper rounded-5 d-flex flex-column align-items-center bg-white p-5">
            <p class="fw-bold fs-2 text-dark">Welcome to Nereid</p>
            <Toast />

            <div v-if="step === SignupStep.email" class="email w-100">
                <Form v-slot="$form" :initialValues="initialValues" :resolver="resolver" @submit="onFormSubmit" class="w-100">
                    <div class="flex flex-col gap-2">
                        <IconField>
                            <InputIcon class="fi fi-rr-user"/>
                            <InputText name="email" type="email" placeholder="Email" variant="filled" size="large" class="rounded-3 border-0 w-100" fluid />
                        </IconField>
                        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
                        <Message class="pt-2" size="small" severity="secondary" variant="simple">We will send code to specified email</Message>
                    </div>
                    <Button type="submit" class="w-100 rounded-3 mt-3 fw-bold" label="Sign up" size="large"/>
                </Form>

                <div class="signup d-flex position-absolute">
                    Already a user?&nbsp;
                    <router-link
                        :to="{
                            name: 'login',
                        }">
                        Login
                    </router-link>
                </div>
            </div>

            <div v-if="step === SignupStep.otp" class="otp w-100">
                <Form v-slot="$form" :initialValues="initialValuesOTP" :resolver="resolverOTP" @submit="onFormSubmitOTP" class="w-100">
                    <div class="flex flex-col gap-2">
                        <Message class="pt-2 pb-3" size="small" severity="secondary" variant="simple">Enter the code sent to <b>{{ emailInput }}</b></Message>
<!--                        <InputOtp name="otp" style="width: 380px"/>-->
                        <InputText name="otp" variant="filled" size="large" class="rounded-3 border-0 w-100" fluid />
                        <Message v-if="$form.otp?.invalid" severity="error" size="small" variant="simple">{{ $form.otp.error?.message }}</Message>
                    </div>
                    <Button type="submit" class="w-100 rounded-3 mt-2 fw-bold" label="Next" size="large"/>
                </Form>

                <div class="d-flex position-absolute">
                    <Button
                        text
                        label="Resend code"/>
                </div>
            </div>

            <div v-if="step === SignupStep.password" class="password w-100">
                <Form v-slot="$form" :initialValues="initialValuesPassword" :resolver="resolverPassword" @submit="onFormSubmitPassword" class="w-100">
                    <div class="flex flex-col gap-2">
                        <Message class="pt-2 pb-3" size="small" severity="secondary" variant="simple">Set up your password</Message>
                        <IconField>
                            <InputIcon class="fi fi-rr-lock z-3"/>
                            <Password name="password" placeholder="Password" variant="filled" size="large" :feedback="false" toggleMask class="border-0 w-100" fluid />
                        </IconField>
                        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{ $form.password.error?.message }}</Message>
                    </div>
                    <Button type="submit" class="w-100 rounded-3 mt-3 fw-bold" label="Sign up" size="large"/>
                </Form>
            </div>
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
    min-width: 470px;

    .p-form {
        > div {
            margin-bottom: 15px;
        }
    }

    ::v-deep(.p-inputtext:not(.p-inputotp-input)) {
        width: 380px;

        &.p-password-input {
            border-radius: var(--bs-border-radius-lg);
            padding-inline-start: calc((var(--p-form-field-padding-x) * 2) + var(--p-icon-size));
        }
    }

    .signup {
        font-size: 0.9rem;
        bottom: 1rem;
        align-self: start;
    }
}
</style>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { Form, FormResolverOptions, FormSubmitEvent } from '@primevue/forms';
import UserService from '../services/user.service';
import InputOtp from 'primevue/inputotp';
import { router } from "@/router";

// Email --------------------------
interface FormValues {
    email: string;
}

interface FormErrors {
    email?: Array<{ message: string }>;
}
// --------------------------------

// OTP ----------------------------
interface FormValuesOTP {
    otp: string;
}

interface FormErrorsOTP {
    otp?: Array<{ message: string }>;
}
// ---------------------------------

// Password ------------------------
interface FormValuesPassword {
    password: string;
}

interface FormErrorsPassword {
    password?: Array<{ message: string }>;
}
// ---------------------------------

enum SignupStep {
    email = 1,
    otp,
    password,
    none,
}

const toast = useToast();
const step = ref<SignupStep>(SignupStep.email);
const emailInput = ref<string>('annamuz@knu.ua');

const initialValues = reactive<FormValues>({
    email: '',
});

const initialValuesOTP = reactive<FormValuesOTP>({
    otp: '',
});

const initialValuesPassword = reactive<FormValuesPassword>({
    password: '',
});

const resolverOTP = ({ values }: FormResolverOptions) => {
    const errors: FormErrorsOTP = {};

    if (!values.otp) {
        errors.otp = [{ message: 'OTP is required' }];
    } else if (values.otp.length != 6) {
        console.log(values)
        errors.otp = [{ message: 'Please enter a 6 symbols code' }];
    }

    return {
        values,
        errors
    };
};

const resolver = ({ values }: FormResolverOptions) => {
    const errors: FormErrors = {};

    if (!values.email) {
        errors.email = [{ message: 'Email is required' }];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = [{ message: 'Please enter a valid email address' }];
    }

    return {
        values,
        errors
    };
};

const resolverPassword = ({ values }: FormResolverOptions) => {
    const errors: FormErrorsPassword = {};

    if (!values.password) {
        errors.password = [{ message: 'Password is required' }];
    }

    return {
        values,
        errors
    };
};

const onFormSubmit = ({ valid, values }: FormSubmitEvent): void => {
    if (valid) {
        const { email } = values;
        emailInput.value = email;

        UserService.signUp({ email }).subscribe({
            next: (data) => {
                console.log(data);
                step.value = SignupStep.otp;
            },
            error: ({ response } = {}) => {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: response?.data.message,
                    life: 5000
                });
            }
        });
    }
};

const onFormSubmitOTP = ({ valid, values }: FormSubmitEvent): void => {
    if (valid) {
        const { otp } = values;

        UserService.checkOtp({
            email: emailInput.value,
            otp,
        }).subscribe({
            next: (data) => {
                UserService.setAuthToken(data.token);
                step.value = SignupStep.password;
            },
            error: ({ response } = {}) => {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: response?.data.message,
                    life: 5000
                });
            }
        });
    }
};

const onFormSubmitPassword = ({ valid, values }: FormSubmitEvent): void => {
    if (valid) {
        const { password } = values;

        UserService.changePassword({ password }).subscribe({
            next: () => {
                router.replace({ name: 'account' });
            },
            error: ({ response } = {}) => {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: response?.data.message,
                    life: 5000
                });
            }
        });
    }
};

</script>
