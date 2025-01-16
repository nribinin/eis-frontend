<template>
    <div>
      <button class="btn waves-effect waves-light" @click="navigateTo('/admin/database')">Datenbank bearbeiten</button>
      <button class="btn waves-effect waves-light" @click="navigateTo('/admin/manageKV')">Klassenvorstand bearbeiten</button>
      <button class="btn waves-effect waves-light" @click="navigateTo('/admin/schueler')">Schüler bearbeiten</button>
      <button class="btn waves-effect waves-light" @click="navigateTo('/admin/lehrer')">Lehrer bearbeiten</button>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default defineComponent({
    name: 'NavigationButtons',
    setup() {
      const router = useRouter();
  
      const navigateTo = (path: string) => {
        router.push(path);
      };
  
      return {
        navigateTo,
      };
    },
  });
  </script>
  
  <style scoped>
  button {
    margin: 5px;
  }
  </style>
  