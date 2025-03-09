<template>
    <Toast baseZIndex.number="1000"/>
    <router-view/>

    <!-- // modals via ModalsService -->
    <template v-for="(modal, index) in ModalsService.modalsList.value"
              v-bind:key="index"
    >
        <Component v-bind:is="modal.Component"
                   :modalInstance="modal"
        ></Component>

    </template>
    <!-- // -->
</template>

<script lang="ts" setup>
    import { useToast } from 'primevue/usetoast';
    import ToastsService from '@/services/toasts.service';
    import ModalsService from '@/services/modals.service';

    const toast = useToast();

    ToastsService.globalToasts.subscribe(toast.add);
</script>
