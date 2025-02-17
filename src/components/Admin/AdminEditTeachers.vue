<template>
  <div class="page-container">

    <!-- Suchfeld -->
    <div class="row search-row">
      <div class="input-field col s12 m8 offset-m2">
        <i class="material-icons prefix">search</i>
        <input id="searchInput" type="text" v-model="searchTerm" />
        <label for="searchInput">Lehrer suchen</label>
      </div>
    </div>

    <!-- Button: Neuen Lehrer anlegen -->
    <div class="button-row">
      <button
            class="waves-effect waves-light btn green mr-1 add-btn"
            @click="openAddModal()"
          >
            Neuen Lehrer anlegen
          </button>
    </div>

    <!-- Liste der Lehrer -->
    <div class="teachers-list">
      <div
        v-for="teacher in filteredTeachers"
        :key="teacher.id"
        class="row teacher-row"
      >
        <div class="col s12 m6">
          <strong>Name:</strong> <br /> {{ teacher.name }}
        </div>
        <div class="col s12 m6">
          <!-- Bearbeiten-Button -->
          <button
            class="waves-effect waves-light btn modal-trigger amber mr-1"
            @click="openEditModal(teacher)"
          >
            Bearbeiten
          </button>
          <!-- Löschen-Button -->
          <button
            class="waves-effect waves-light btn red"
            @click="confirmDelete(teacher)"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Neuen Lehrer anlegen -->
    <div id="modalAddTeacher" class="modal">
      <div class="modal-content">
        <h5>Neuen Lehrer anlegen</h5>
        <div class="row">
          <!-- Eingabefeld: Lehrer-Name -->
          <div class="input-field col s12">
            <input
              type="text"
              id="teacherName"
              v-model="newTeacherName"
              required
            />
            <label for="teacherName">Name</label>
          </div>
        </div>
        <div class="row">
          <!-- Multi-Select: Unterrichtseinheiten -->
          <div class="input-field col s12 dropdown-area">
            <label>Fächer (Lessons) auswählen:</label>
            <select multiple v-model="selectedLessonIdsAdd">
              <option
                v-for="lesson in lessons"
                :key="lesson.id"
                :value="lesson.id"
              >
                {{ lesson.hitclassName }} - {{ lesson.subjectName }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <a href="#!" class="modal-close waves-effect btn grey mr-1">
          Abbrechen
        </a>
        <a
          href="#!"
          class="modal-close waves-effect btn green"
          @click.prevent="createTeacher"
        >
          Anlegen
        </a>
      </div>
    </div>

    <!-- Modal: Lehrer bearbeiten (nur Lesson-Ids) -->
    <div id="modalEditTeacher" class="modal">
      <div class="modal-content">
        <h5>Lehrer bearbeiten</h5>
        <!-- Lehrer-Name nur anzeigen, nicht änderbar -->
        <div class="row">
          <div class="col s12">
            <p><strong>Lehrer:</strong> {{ teacherToEdit?.name }}</p>
          </div>
        </div>
        <div class="row">
          <!-- Multi-Select: schon vorhandene lessonIds vorausgewählt -->
          <div class="input-field col s12 dropdown-area">
            <select multiple v-model="selectedLessonIdsEdit">
              <option
                v-for="lesson in lessons"
                :key="lesson.id"
                :value="lesson.id"
              >
                {{ lesson.hitclassName }} - {{ lesson.subjectName }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <a href="#!" class="modal-close waves-effect btn grey mr-1">
          Abbrechen
        </a>
        <a
          href="#!"
          class="modal-close waves-effect btn green"
          @click.prevent="updateTeacher"
        >
          Speichern
        </a>
      </div>
    </div>

    <!-- Materialize Modal: Lehrer löschen -->
    <div id="modalDelete" class="modal">
      <div class="modal-content">
        <h5>Löschen bestätigen</h5>
        <p>
          Bist du sicher, dass du den Lehrer
          <strong>{{ teacherToDelete?.name }}</strong>
          löschen möchtest?
        </p>
      </div>
      <div class="modal-footer">
        <a href="#!" class="modal-close waves-effect btn grey mr-1" @click="cancelDelete">
          Abbrechen
        </a>
        <a href="#!" class="modal-close waves-effect btn red" @click="deleteTeacherNow">
          Löschen
        </a>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, nextTick } from "vue";
import axios from "axios";
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";

declare const M: any;

/** 
 * TeacherWithLessonsDto, wie vom Endpoint /admin/getAllTeachersWithLessons 
 * z. B. { id: 10, name: "Max Mustermann", lessonIds: [101, 102] }
 */
interface TeacherWithLessonsDto {
  id: number;
  name: string;
  lessonIds?: number[]; 
}

/**
 * LessonDto, wie vom Endpoint /admin/getAllLessons
 * { id: number, subjectName: string, hitclassName: string }
 */
interface LessonDto {
  id: number;
  subjectName: string;
  hitclassName: string;
}

export default defineComponent({
  name: "TeacherManagement",
  setup() {
    const snackbar = useSnackbarStore();

    // Haupt-Liste der Lehrer
    const teachers = ref<TeacherWithLessonsDto[]>([]);
    // Liste aller Fächer (Lessons)
    const lessons = ref<LessonDto[]>([]);
    // Suchfeld
    const searchTerm = ref("");

    // "Neuen Lehrer anlegen" States
    const newTeacherName = ref("");
    const selectedLessonIdsAdd = ref<number[]>([]);

    // "Bearbeiten" States
    const teacherToEdit = ref<TeacherWithLessonsDto | null>(null);
    const selectedLessonIdsEdit = ref<number[]>([]);

    // "Löschen" States
    const teacherToDelete = ref<TeacherWithLessonsDto | null>(null);

    // Lifecycle
    onMounted(async () => {
      // Materialize modals init
      const modalElems = document.querySelectorAll(".modal");
      M.Modal.init(modalElems);

      // Daten laden
      await fetchAllTeachers();
      await fetchAllLessons();
    });

    /**
     * GET /admin/getAllTeachersWithLessons
     * => TeacherWithLessonsDto[] (id, name, lessonIds)
     */
    async function fetchAllTeachers() {
      try {
        const response = await axios.get("/admin/getAllTeachersWithLessons");
        teachers.value = response.data;
      } catch (error) {
        snackbar.push("Fehler beim Laden der Lehrer: " + error);
      }
    }

    /**
     * GET /admin/getAllLessons
     * => LessonDto[] (id, subjectName, hitclassName)
     */
    async function fetchAllLessons() {
      try {
        const response = await axios.get("/admin/getAllLessons");
        lessons.value = response.data;

        // Nach dem Laden => init Materialize-Select
        nextTick(() => initMaterializeSelect());
      } catch (error) {
        snackbar.push("Fehler beim Laden der Fächer: " + error);
      }
    }

    function initMaterializeSelect() {
      const elems = document.querySelectorAll("select");
      M.FormSelect.init(elems, {
        dropdownOptions: {
          container: document.body,
          constrainWidth: false,
          coverTrigger: false
        }
      });
    }

    /**
     * POST /admin/newTeacher
     * -> { name, lessonIds }
     */
    async function createTeacher() {
      try {
        const body = {
          name: newTeacherName.value,
          lessonIds: selectedLessonIdsAdd.value
        };
        const response = await axios.post("/admin/newTeacher", body);
        if (response.status === 201) {
          snackbar.push("Neuer Lehrer erfolgreich angelegt!");
          // Form reset
          newTeacherName.value = "";
          selectedLessonIdsAdd.value = [];
          await fetchAllTeachers();
        } else {
          await fetchAllTeachers();
          snackbar.push("Lehrer angelegt/aktualisiert.");
        }
      } catch (error: any) {
        snackbar.push("Fehler beim Anlegen des Lehrers: " + (error.response?.data ?? error));
      }
    }

    /**
     * Lehrer Bearbeiten => Fächer bearbeiten
     */
    function openEditModal(teacher: TeacherWithLessonsDto) {
      teacherToEdit.value = teacher;

      // existing lessonIds => vorausgewählt
      if (teacher.lessonIds) {
        selectedLessonIdsEdit.value = [...teacher.lessonIds];
      } else {
        selectedLessonIdsEdit.value = [];
      }

      // Materialize Modal #modalEditTeacher öffnen
      const elem = document.getElementById("modalEditTeacher");
      if (elem) {
        const instance = M.Modal.getInstance(elem);
        instance.open();
      }

      nextTick(() => initMaterializeSelect());
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
    }

    function openAddModal() {
      // Materialize Modal #modalEditTeacher öffnen
      const elem = document.getElementById("modalAddTeacher");
      if (elem) {
        const instance = M.Modal.getInstance(elem);
        instance.open();
      }

      nextTick(() => initMaterializeSelect());
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
    }

    /**
     * PUT /admin/updateTeacher => { id, lessonIds }
     */
    async function updateTeacher() {
      if (!teacherToEdit.value) return;
      try {
        const body = {
          id: teacherToEdit.value.id,
          lessonIds: selectedLessonIdsEdit.value
        };
        const resp = await axios.put("/admin/updateTeacher", body);
        if (resp.status === 200) {
          snackbar.push("Lehrer-Fächer erfolgreich aktualisiert!");
          await fetchAllTeachers();
        }
      } catch (error: any) {
        snackbar.push("Fehler beim Aktualisieren: " + (error.response?.data ?? error));
      }
    }

    /**
     * Lehrer löschen => Materialize Modal #modalDelete
     */
    function confirmDelete(teacher: TeacherWithLessonsDto) {
      teacherToDelete.value = teacher;
      // Materialize Modal öffnen
      const elem = document.getElementById("modalDelete");
      if (elem) {
        const instance = M.Modal.getInstance(elem);
        instance.open();
      }
    }
    function cancelDelete() {
      teacherToDelete.value = null;
    }
    async function deleteTeacherNow() {
      if (!teacherToDelete.value) return;
      try {
        await axios.delete(`/admin/deleteTeacher/${teacherToDelete.value.id}`);
        teacherToDelete.value = null;
        await fetchAllTeachers();
        snackbar.push("Lehrer erfolgreich gelöscht.");
      } catch (error) {
        snackbar.push("Fehler beim Löschen des Lehrers: " + error);
      }
    }

    /**
     * Computed: Filter
     */
    const filteredTeachers = computed(() => {
      if (!searchTerm.value.trim()) return teachers.value;
      const lower = searchTerm.value.toLowerCase();
      return teachers.value.filter((t) => t.name.toLowerCase().includes(lower));
    });

    return {
      // states
      teachers,
      lessons,
      searchTerm,
      
      newTeacherName,
      selectedLessonIdsAdd,
      
      teacherToEdit,
      selectedLessonIdsEdit,
      
      teacherToDelete,

      // lifecycle
      fetchAllTeachers,
      fetchAllLessons,
      initMaterializeSelect,

      // CRUD
      createTeacher,
      openEditModal,
      updateTeacher,
      confirmDelete,
      cancelDelete,
      deleteTeacherNow,
      openAddModal,

      // computed
      filteredTeachers
    };
  }
});
</script>

<style scoped>
/* Zentrierter Container */
.page-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

/* Suchfeld + Button-Row */
.search-row {
  margin-top: 10px;
  margin-bottom: 20px;
}
.button-row {
  margin-bottom: 20px;
  text-align: center;
}
.add-btn {
  margin-right: 10px;
}

/* Liste der Lehrer */
.teachers-list {
  margin-bottom: 30px;
}
.teacher-row {
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
}
.teacher-row:last-child {
  border-bottom: none;
}

/* Multi-select styling */
.dropdown-area {
  margin-bottom: 30px;
}
.dropdown-content.select-dropdown {
  max-height: 300px !important;
  overflow-y: auto !important;
}

/* Materialize Modals abgerundete Ecken */
.modal {
  border-radius: 10px !important;
  overflow: hidden;
}

</style>
