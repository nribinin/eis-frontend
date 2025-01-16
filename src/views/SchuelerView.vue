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
  import Legende from "@/components/LegendeKomp.vue";
  import SchuelerTable from "@/components/SchuelerTable.vue";
  import SchuelerHeader from "@/components/SchuelerHeader.vue";
  
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
  