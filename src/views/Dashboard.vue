<template>
    <Toast baseZIndex.number="1000"/>
    <router-view/>
</template>

<script lang="ts" setup>
import { useToast } from 'primevue/usetoast';
import ToastsService from '@/services/toasts.service';

const toast = useToast();

ToastsService.globalToasts.subscribe(toast.add);
</script>
