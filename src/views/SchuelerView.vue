<!-- SchuelerView.vue -->
<template>
  <div class="flex-container-vertically">
    <SchuelerHeader />
    <Legende />
    <SchuelerTable />
  </div>
</template>

<script>
import Legende from "@/components/Teacher/LegendeKomp.vue";
import SchuelerTable from "@/components/Students/SchuelerTable.vue";
import SchuelerHeader from "@/components/Students/SchuelerHeader.vue";

export default {
  components: {
    Legende,
    SchuelerTable,
    SchuelerHeader,
  },
};
</script>

<style scoped>
.flex-container-vertically {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
@media (max-width: 768px) {
  .flex-container-vertically {
    height: auto;
  }
}
</style>
