<template>
  <div class="home">
    <Header/>
    <Poker/>
  </div>
</template>

<script>
import Poker from '@/components/Poker.vue'
import Header from '@/components/Header.vue'

export default {
  name: 'home',
  components: {
    Poker,
    Header
  }
}
</script>