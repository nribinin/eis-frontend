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
      <a
        href="#modalAddTeacher"
        class="waves-effect waves-light btn green modal-trigger add-btn"
      >
        Neuen Lehrer anlegen
      </a>
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
          <button
            class="waves-effect waves-light btn red right"
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
          <!-- Lehrer-Name -->
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
          <!-- Multi-Select: Zuordnung zu Lessons -->
          <div class="input-field col s12 dropdown-area">
            <label>Unterrichtseinheiten (Lessons) auswählen:</label>
            <select multiple v-model="selectedLessonIds">
              <option
                v-for="lesson in lessons"
                :key="lesson.id"
                :value="lesson.id"
              >
                {{ lesson.classRoomName }} - {{ lesson.subjectName }}
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

    <!-- Materialize Modal: Lehrer löschen bestätigen -->
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
        <a
          href="#!"
          class="modal-close waves-effect btn grey mr-1"
          @click="cancelDelete"
        >
          Abbrechen
        </a>
        <a
          href="#!"
          class="modal-close waves-effect btn red"
          @click="deleteTeacherNow"
        >
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

interface TeacherDto {
  id: number;
  name: string;
}

interface LessonDto {
  id: number;
  subjectName: string;
  classRoomName: string;
}

export default defineComponent({
  name: "TeacherManagement",
  setup() {
    const snackbar = useSnackbarStore();

    const teacherToDelete = ref<TeacherDto | null>(null);

    // State: Lehrer
    const teachers = ref<TeacherDto[]>([]);
    const searchTerm = ref("");

    // Neuer Lehrer
    const newTeacherName = ref("");
    const selectedLessonIds = ref<number[]>([]);

    // Lessons
    const lessons = ref<LessonDto[]>([]);

    onMounted(() => {
      const modalElems = document.querySelectorAll(".modal");
      M.Modal.init(modalElems);
      fetchTeachers();
      fetchLessons();
    });

    // Lessons laden + Materialize Select init
    async function fetchLessons() {
      try {
        const response = await axios.get("/admin/getAllLessons");
        lessons.value = response.data;
        nextTick(() => initializeSelect());
      } catch (error) {
        snackbar.push("Fehler beim Laden der Lessons: " + error);
      }
    }

    // Lehrer laden
    async function fetchTeachers() {
      try {
        const response = await axios.get("/admin/getAllTeachers");
        teachers.value = response.data;
      } catch (error) {
        snackbar.push("Fehler beim Laden der Lehrer: " + error);
      }
    }

    function initializeSelect() {
      const elems = document.querySelectorAll("select");
      M.FormSelect.init(elems, {
        dropdownOptions: {
          container: document.body,
          constrainWidth: false,
          coverTrigger: false,
        },
      });
    }

    // Lehrer anlegen
    async function createTeacher() {
      try {
        const body = {
          name: newTeacherName.value,
          lessonIds: selectedLessonIds.value,
        };

        const response = await axios.post("/admin/newTeacher", body, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 201) {
          snackbar.push("Neuer Lehrer erfolgreich angelegt!");
          newTeacherName.value = "";
          selectedLessonIds.value = [];
          await fetchTeachers();
        } else {
          await fetchTeachers();
          snackbar.push("Lehrer angelegt/aktualisiert.");
        }
      } catch (error: any) {
        snackbar.push(
          "Fehler beim Anlegen des Lehrers: " +
            (error.response?.data ?? error)
        );
      }
    }

    // Lehrer löschen
    function confirmDelete(teacher: TeacherDto) {
      teacherToDelete.value = teacher;
      // Open the Materialize modal instance for deletion
      const elem = document.getElementById("modalDelete");
      const instance = M.Modal.getInstance(elem);
      instance.open();
    }
    function cancelDelete() {
      teacherToDelete.value = null;
    }
    async function deleteTeacherNow() {
      if (!teacherToDelete.value) return;
      try {
        await axios.delete(`/admin/deleteTeacher/${teacherToDelete.value.id}`);
        teacherToDelete.value = null;
        await fetchTeachers();
        snackbar.push("Lehrer erfolgreich gelöscht.");
      } catch (error) {
        snackbar.push("Fehler beim Löschen des Lehrers: " + error);
      }
    }

    // Gefilterte Lehrer
    const filteredTeachers = computed(() => {
      if (!searchTerm.value.trim()) return teachers.value;
      const lower = searchTerm.value.toLowerCase();
      return teachers.value.filter((t) =>
        t.name.toLowerCase().includes(lower)
      );
    });

    return {
      // States
      teachers,
      lessons,
      searchTerm,
      newTeacherName,
      selectedLessonIds,
      teacherToDelete,

      // Methods
      fetchTeachers,
      fetchLessons,
      createTeacher,
      deleteTeacherNow,
      initializeSelect,
      confirmDelete,
      cancelDelete,

      // Computed
      filteredTeachers,
    };
  },
});
</script>

<style scoped>
/* Rounded corners for all Materialize modals */
.modal {
  border-radius: 10px !important;
  overflow: hidden;
}

/* Zentrierter Container, ähnlich wie EditStudents */
.page-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

/* Suchfeld analog EditStudents */
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

/* Materialize Scroll fix */
.dropdown-content.select-dropdown {
  max-height: 300px !important;
  overflow-y: auto !important;
}
</style>
