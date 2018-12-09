<template>
    <div class="effort-option" v-on:click="vote(value, parent)" :style="{ 
        width: value * 100 / 55 + '%',
        height: value * 100 / 34 + '%',
        left: left * 100 / 55 + '%',
        top: top * 100 / 34 + '%',
        backgroundColor: 'rgb(0, ' + (200 - order * 10) + ', ' + 160 + order * 10 + ')',
        fontSize: value * 0.618 + 'vmin' // order * 100 + '%'
    }">
        <span>{{ value }}</span>
    </div>
</template>

<script>
    export default {
        name: 'EffortOption',
        props: {
            value: Number,
            left: Number,
            top: Number,
            order: Number,
            parent: {}
        },
        inject: ['vote']
    }
</script>

<style scoped>
    .effort-option {
        display: inline-block;
        position: absolute;
        border: 1px solid #FFF;
        text-align: center;
        color: #FFFFFF;
    }
    .effort-option:hover {
        cursor: pointer;
        background-color: #0033DD !important;
    }
    .effort-option > span {
        display: inline-block;
        vertical-align: middle;
    }
</style>