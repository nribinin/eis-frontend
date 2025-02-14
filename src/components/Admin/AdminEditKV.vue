<template>
  <div class="container">
    <div class="classroom-wrapper">
      <div
        class="classroom-card"
        v-for="classroom in classrooms"
        :key="classroom.id"
      >
        <div class="card-content">
          <h5 class="card-title">{{ classroom.name }}</h5>
          <p>
            <strong>Klassenvorstand:</strong>
            <br>
            <span v-if="classroom.klassenvorstand">
              {{ classroom.klassenvorstand }}
            </span>
            <span v-else>
              <em>Kein Klassenvorstand</em>
            </span>
          </p>
        </div>
        <div class="card-action">
          <a
            href="#modalAssign"
            class="btn modal-trigger red"
            @click="openModal(classroom)"
          >
            Klassenvorstand ändern
          </a>
        </div>
      </div>
    </div>

    <!-- Modal zum Zuweisen des Klassenvorstands -->
    <div id="modalAssign" class="modal">
      <div class="modal-content">
        <h4>
          Klassenvorstand für
          <span v-if="selectedClassroom">{{ selectedClassroom.name }}</span>
        </h4>
        <div class="input-field">
          <select v-model="selectedTeacherId">
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
        <a
          href="#!"
          class="modal-close waves-effect waves-green btn-flat"
          @click.prevent="assignKlassenvorstand"
          :class="{ disabled: !selectedTeacherId || assigning }"
        >
          Speichern
        </a>
        <a href="#!" class="modal-close waves-effect waves-red btn-flat">
          Abbrechen
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

interface Classroom {
  id: number;
  name: string;
  klassenvorstand: string | null;
}

const classrooms = ref<Classroom[]>([]);
const allTeachers = ref<Teacher[]>([]);

const selectedClassroom = ref<Classroom | null>(null);
const selectedTeacherId = ref<number | "">("");
const assigning = ref(false);

async function fetchClassrooms() {
  try {
    const response = await axios.get("/admin/classrooms/with-teachers");
    classrooms.value = response.data;
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

function openModal(classroom: Classroom) {
  selectedClassroom.value = classroom;
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
  });
}

async function assignKlassenvorstand() {
  if (!selectedClassroom.value || !selectedTeacherId.value) return;
  assigning.value = true;
  try {
    const response = await axios.put("/admin/setKlassenvorstand", null, {
      params: {
        classroomId: selectedClassroom.value.id,
        teacherId: selectedTeacherId.value,
      },
    });
    if (response.status === 200) {
      await fetchClassrooms();
    }
  } catch (error: any) {
    snackbar.push("Fehler beim Zuweisen des Klassenvorstands: " + error);
  } finally {
    assigning.value = false;
  }
}

onMounted(async () => {
  await fetchClassrooms();
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

/* Wrapper für alle Karten (Kacheln) – vertikal gestapelt */
.classroom-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Stil der einzelnen Klassen-Karten */
.classroom-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  padding: 20px;
}

/* Typografie */
.card-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

/* Aktion-Button: Rechts ausgerichtet */
.card-action {
  text-align: right;
}

/* Responsive Anpassungen */
@media only screen and (max-width: 600px) {
  .classroom-card {
    padding: 15px;
  }
  .card-title {
    font-size: 1.3rem;
  }
}
</style>
