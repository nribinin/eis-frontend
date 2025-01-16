<template>
  <!-- <div class="links">
    <RouterLink to="/" active-class="active">Login</RouterLink>
    <RouterLink to="/header" active-class="active">Header</RouterLink>
  </div> -->

  <RouterView />
  <snackbar></snackbar>
</template>

<script setup lang="ts">
import M from 'materialize-css'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import snackbar from '@/components/SnackbarDisplayer.vue'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

onMounted(() => {
  M.AutoInit()
})
</script>