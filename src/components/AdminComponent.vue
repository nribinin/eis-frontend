<template>
    <div>
      
      <div class="button-box">
        <button @click="navigateTo('/admin/database')">Datenbank bearbeiten</button>
      </div>
      <div class="button-box">
        <button @click="navigateTo('/admin/editkv')">Klassenvorstand bearbeiten</button>
      </div>
      <div class="button-box">
        <button @click="navigateTo('/admin/schueler')">Schüler bearbeiten</button>
      </div>
      <div class="button-box">
        <button @click="navigateTo('/admin/lehrer')">Lehrer bearbeiten</button>
      </div>
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
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
  }
  
  .button-box {
    background-color: #ffffff;
    border-radius: 0.5em;
    box-shadow: 0 0.25em 0.5em rgba(0, 0, 0, 0.1);
    padding: 2em;
    margin: 1em;
    text-align: left;
  }
  
  .button-box p {
    margin-bottom: 1em;
    color: #333333;
    text-align: left;
    padding-left: 0;
  }
  
  .button-box button {
    background-color: #d9534f;
    color: #ffffff;
    border: none;
    border-radius: 0.25em;
    padding: 0.5em 1em;
    cursor: pointer;
    font-size: 1em;
    text-align: left;
    margin-left: 0;
  }
  
  .button-box button:hover {
    background-color: #c9302c;
  }
  </style>