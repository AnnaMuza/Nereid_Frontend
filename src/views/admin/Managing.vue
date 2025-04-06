<template>
    <div>Hello</div>
</template>

<script lang="ts" setup>
import { useToast } from 'primevue/usetoast';
import ToastsService from '@/services/toasts.service';

const toast = useToast();

ToastsService.globalToasts.subscribe(toast.add);
</script>
