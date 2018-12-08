<template>
    <div class="effort-option" v-on:click="vote(value)" :style="{ width: value * 20 + 'px', height: value * 20 + 'px'}">
        {{ value }}
    </div>
</template>

<script>
    export default {
        name: 'EffortOption',
        props: {
            value: Number
        },
        inject: ['vote']
    }
</script>

<style scoped>
    .effort-option {
        display: inline-block;
        background-color: #F00;
        border: 1px solid #A00;
        line-height: 50px;
    }
</style>