<template>
    <div class="flex-container-vertically">
      <TeacherComponent />
    </div>
  </template>
  
  
  <style>scoped
    .flex-container-vertically {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
  </style>
  
  
  <script>
import TeacherComponent from "@/components/TeacherComponent.vue";
  
      export default {
        data() {
          return {
            
          };
        },
        components: {
          TeacherComponent
        },
        computed: {},
        methods: {
          
        },
        
      };
  </script>
  