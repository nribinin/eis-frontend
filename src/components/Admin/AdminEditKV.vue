<template>
  <div class="container">
    <div class="hitclass-wrapper">
      <div
        class="hitclass-card"
        v-for="hitclass in hitclasses"
        :key="hitclass.id"
      >
        <div class="card-content">
          <h5 class="card-title">{{ hitclass.name }}</h5>
          <div class="info-row">
            <div class="teacher-info">
              <strong>Klassenvorstand:</strong>
              <br>
              <span v-if="hitclass.klassenvorstand">
                {{ hitclass.klassenvorstand }}
              </span>
              <span v-else>
                <em>Kein Klassenvorstand</em>
              </span>
            </div>
            <div class="change-btn">
              <a
                href="#modalAssign"
                class="btn modal-trigger red"
                @click="openModal(hitclass)"
              >
                Klassenvorstand ändern
              </a>
            </div>
          </div>
        </div>
      </div>
      <br>
    </div>

    <div id="modalAssign" class="modal">
      <div class="modal-content">
        <h4>
          Klassenvorstand für
          <span v-if="selectedHitclass">{{ selectedHitclass.name }}</span>
        </h4>
        <div class="input-field">
          <select v-model="selectedTeacherId" style="color:black">
            <option disabled value="">-- Bitte wählen --</option>
            <option
              v-for="teacher in allTeachers"
              :key="teacher.id"
              :value="teacher.id"
            >
              {{ teacher.name }}
            </option>
          </select>
          <label>Lehrer auswählen</label>
        </div>
      </div>
      <div class="modal-footer">
        <a href="#!" class="modal-close waves-effect waves-red btn red mr-1">
          Abbrechen
        </a>
        <a
          href="#!"
          class="modal-close waves-effect waves-green btn green"
          @click.prevent="assignKlassenvorstand"
          :class="{ disabled: !selectedTeacherId || assigning }"
        >
          Speichern
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from "vue";
import axios from "axios";
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";
const snackbar = useSnackbarStore();

declare const M: any;

interface Teacher {
  id: number;
  name: string;
}

interface Hitclass {
  id: number;
  name: string;
  klassenvorstand: string | null;
}

const hitclasses = ref<Hitclass[]>([]);
const allTeachers = ref<Teacher[]>([]);

const selectedHitclass = ref<Hitclass | null>(null);
const selectedTeacherId = ref<number | "">("");
const assigning = ref(false);

async function fetchHitclasses() {
  try {
    const response = await axios.get("/admin/hitclasses/with-teachers");
    hitclasses.value = response.data;
  } catch (error) {
    snackbar.push("Fehler beim Laden der Klassen: " + error);
  }
}

async function fetchAllTeachers() {
  try {
    const response = await axios.get("/admin/getAllTeachers");
    const data = response.data as { id: number; name: string }[];
    data.sort((a, b) => a.name.localeCompare(b.name));
    allTeachers.value = data;
  } catch (error) {
    snackbar.push("Fehler beim Laden der Lehrer: " + error);
  }
}

function openModal(hitclass: Hitclass) {
  selectedHitclass.value = hitclass;
  selectedTeacherId.value = "";
  assigning.value = false;

  nextTick(() => {
    const selectElems = document.querySelectorAll("#modalAssign select");
    M.FormSelect.init(selectElems, {
      dropdownOptions: {
        container: document.body,
        constrainWidth: false,
        coverTrigger: false,
      },
    });

    // Wait a bit so Materialize sets its inline styles,
    // then override them with your preferred values
    setTimeout(() => {
      const dropdownElems = document.querySelectorAll('.dropdown-content.select-dropdown');
      dropdownElems.forEach(el => {
        (el as HTMLElement).style.maxHeight = '600px';
        (el as HTMLElement).style.overflowY = 'auto';
      });
    }, 50); // Adjust the timeout if needed
    setTimeout(() => {
      const dropdownElems = document.querySelectorAll('.dropdown-content.select-dropdown span');
      dropdownElems.forEach(el => {
        (el as HTMLElement).style.color = 'black';
      });
    }, 50); // Adjust the timeout if needed
    
  });
}

async function assignKlassenvorstand() {
  if (!selectedHitclass.value || !selectedTeacherId.value) return;
  assigning.value = true;
  try {
    const response = await axios.put("/admin/setKlassenvorstand", null, {
      params: {
        hitclassId: selectedHitclass.value.id,
        teacherId: selectedTeacherId.value,
      },
    });
    if (response.status === 200) {
      await fetchHitclasses();
    }
  } catch (error: any) {
    snackbar.push("Fehler beim Zuweisen des Klassenvorstands: " + error);
  } finally {
    assigning.value = false;
  }
}

onMounted(async () => {
  await fetchHitclasses();
  await fetchAllTeachers();
  const modalElems = document.querySelectorAll(".modal");
  M.Modal.init(modalElems);
});
</script>

<style scoped>
.container {
  margin-top: 40px;
  max-width: 600px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.hitclass-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hitclass-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 20px;
}

.card-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

@media only screen and (max-width: 600px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

.teacher-info {
  flex: 1;
}
h5 {
  margin: 0;
}
</style>
