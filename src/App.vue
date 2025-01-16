<script setup>
import { RouterView } from 'vue-router'
</script>

<template>

  <!-- <div class="links">
    <RouterLink to="/" active-class="active">Login</RouterLink>
    <RouterLink to="/header" active-class="active">Header</RouterLink>
  </div> -->

  <RouterView />
</template>

<script>
import M from 'materialize-css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

export default {
  mounted() {
    M.AutoInit()
  }
}
</script>