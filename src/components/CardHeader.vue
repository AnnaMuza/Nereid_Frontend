<template>
    <div class="d-flex align-items-center">
        <i class="icon rounded-1" :class="iconClass"></i>
        <span class="text">{{ title }}</span>
    </div>
</template>

<script>
export default {
    name: 'CardHeader',
    props: {
        icon: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        }
    },
    computed: {
        iconClass() {
            return `pi pi-${this.icon}`;
        }
    }
}
</script>

<style lang="scss" scoped>

.icon {
    padding: 7px;
    margin-right: 10px;
    background-color: var(--bs-grey-light);
}

.icon,
.text {
    font-size: 1.5rem;
}

</style>
