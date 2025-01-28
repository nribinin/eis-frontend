<template>
    <div class="flex-container-vertically">
      <SchuelerHeader />
  
      <Legende />
      <SchuelerTable />
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
  import Legende from "@/components/Teacher/LegendeKomp.vue";
  import SchuelerTable from "@/components/Students/SchuelerTable.vue";
  import SchuelerHeader from "@/components/Students/SchuelerHeader.vue";
  
      export default {
        data() {
          return {
            
          };
        },
        components: {
          Legende,
          SchuelerTable,
          SchuelerHeader
        },
        computed: {},
        methods: {
          
        },
        
      };
  </script>
  