<template>
    <div class="container header">
      <div class="row">
        <div class="col-12">
          <h1>Planning Poker</h1>
          <p>An <a href="https://github.com/skotz/effort-vue">open source</a> team estimation tool built with Vue and Firebase.</p>
        </div>
      </div>
    </div>
</template>

<script>
    export default {
        name: 'Header'
    }
</script>

<style>
    .container {
        max-width: 768px;
        min-width: 768px;
    }
    .header {
        margin-top: 15px;
    }
</style>