<template>

    <div class="position-absolute h-100 w-100 z-3 pe-none" style="box-shadow: inset 0 0 10px 17px var(--bs-back)"></div>
    <div class="py-by px-bx d-flex h-100 w-100 overflow-y-hidden">
        <app-menu-sidebar></app-menu-sidebar>

        <div class="overflow-y-scroll overflow-x-hidden w-100" style="padding: 5px 0">
            <router-view/>
        </div>
    </div>

</template>

<script setup lang="ts">
    import AppMenuSidebar from '@/components/MenuSidebar.vue';
    import { RouterView } from 'vue-router';
</script>
