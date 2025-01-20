<template>
  <div class="maincontainer">
      <div class="fixed headcontainer">
          <div class="header">
              <nav>
                  <ul>
                      <li>
                          <h3>Ampeleintragung</h3>
                      </li>
                      <div>
                          <li class="selectSite hoveOnKV choose" @click="toTeacher" >
                            Ampeleintragung
                          </li>
                          <li class="selectedSite choose  ">
                             KV-Ansicht
                          </li>
                      </div>
                  </ul>
              </nav>
          </div>
          <Legende />
      </div>

      <KV/>

  </div>
</template>

<script lang="ts" setup>
import KV from '@/components/KVComponent.vue';
import Legende from '@/components/TeacherHeader.vue';

import { useRouter } from "vue-router"
const router = useRouter();

async function toTeacher() {
    router.push("/lehrer");
}

</script>

<style scoped>
.icontext{
  display: flex !important;
  align-items: center !important;
  flex-direction:initial ;
}
.maincontainer {
  overflow-y: auto;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}
.header {
  width: 100%;
}

.fixed {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
}

body {
  overflow-y: hidden;
  height: auto;
}

nav ul {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
  background-color: black;
}

h3 {
  margin: 0 !important;
  margin-left: 0.5em !important;
}

.selectedSite {
  color: #000000;
  background-color: #ffffff;
}

.hoveOnKV:hover {
  color: #000000;
  background-color: #cdc1c1;
  cursor: pointer;
}

.choose {
  padding-right: 10px;
  padding-left: 10px;
}

@media screen and (max-width: 900px) {
          h3 {
              font-size: 1em !important;
          }
          nav{
              height: 10vh !important;
          }
          ul{
              height: 10vh !important;
          }
      }

.selectSite{
  cursor: pointer;
}
</style>