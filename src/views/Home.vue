<template>
  <div class="home">
    <Header/>
    <Login/>
  </div>
</template>

<script>
import Login from '@/components/Login.vue'
import Header from '@/components/Header.vue'

export default {
  name: 'home',
  components: {
    Login,
    Header
  }
}
</script>