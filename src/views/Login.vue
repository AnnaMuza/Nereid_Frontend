<template>
    <div class="login-bg-image d-flex flex-column align-items-center justify-content-center w-100 h-100">
        <div class="login-wrapper rounded-5 d-flex flex-column align-items-center bg-white p-5">
          <p class="fw-bold fs-2 text-dark">Welcome back</p>
            <!-- <h1 class="h3 fw-normal pt-3 pb-4"></h1> TODO assign project name -->

            <FormView :formGroup="loginForm"  @enterPressed="login()">

                <template #email>
                    <IconField class="mb-2">
                        <InputIcon class="fi fi-rr-user"/>
                        <InputText id="email" v-model="loginForm.controls.email.value"
                                   class="rounded-3 border-0"
                                   name="email"
                                   type="email"
                                   placeholder="Nickname"
                                   variant="filled"
                                   size="large"
                                   v-on:input="loginForm.controls.email.touched = true"/>
                    </IconField>
                </template>

                <template #password>
                    <IconField class="mb-2">
                        <InputIcon class="fi fi-rr-lock z-3"/>
                        <Password id="password" v-model="loginForm.controls.password.value"
                                  :feedback="false" :required="true"
                                  inputClass="rounded-3 border-0"
                                  name="password"
                                  placeholder="Password"
                                  variant="filled"
                                  size="large"
                                  toggleMask/>
                    </IconField>
                </template>

            </FormView>

            <Button class="w-100 rounded-3 mt-3 fw-bold" label="Login" @click="login" size="large"/>

        </div>

    </div>

</template>

<style lang="scss" scoped>

.login-bg-image {
    background-image: url("../assets/images/login-bg.jpg");
    background-position: left;
    background-repeat: no-repeat;
    background-size: contain;
}

.login-wrapper {
    position: absolute;
    right: 30%;

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
    import {reactive} from 'vue';
    import AuthService from '../services/auth.service';
    import { router } from '@/router';
    import { FormView } from '@/components'
    import { FormGroup } from '@/core/form-group';
    import { FormControlBoolean, FormControlString } from '@/core/form-controls';
    import { FormControlFieldDisplayType } from '@/constants';
    import { useToast } from 'primevue/usetoast';
    import IconField from 'primevue/iconfield';
    import InputIcon from 'primevue/inputicon';
    import Password from 'primevue/password';

    const loginForm = reactive(
        new FormGroup({
            email: {
                control: new FormControlString('email', {
                    type: FormControlFieldDisplayType.Text,
                    label: 'Email',
                    required: true,
                    defaultValue: ''
                })
            },
            password: {
                control: new FormControlString('password', {
                    type: FormControlFieldDisplayType.Text,
                    label: 'Password',
                    required: true,
                    defaultValue: ''
                })
            },
            rememberMe: {
                control: new FormControlBoolean('rememberMe', {
                    type: FormControlFieldDisplayType.Checkbox,
                    label: 'Remember Me',
                    required: false,
                    defaultValue: false
                })
            }
        })
    );

    const toast = useToast();

    const login = () =>  {
        loginForm.markAsTouched();
        loginForm.updateValidity();
        if (loginForm.invalid) {
            return;
        }
        const { email, password, rememberMe } = loginForm.formValue;
        if (email && password) {
            AuthService.login({
                email,
                password
            }, !!rememberMe).subscribe({
                next: () => {
                    const {redirectTo = ''} = router.currentRoute.value.query;
                    router.push(redirectTo ? {path: redirectTo.toString()} : { path: '/' });
                },
                error: ({response} = {}) => {
                    const { message = 'Login failed' } = response?.data || {};
                    toast.add({ severity: 'error', summary: message, life: 5000 });
                }
            });
        }
    };

</script>
