<template>
  <div class="page-container">
    <!-- Suchfeld -->
    <div class="row search-row">
      <div class="input-field col s12 m8 offset-m2">
        <i class="material-icons prefix">search</i>
        <input
          id="searchInput"
          type="text"
          v-model="searchTerm"
        />
        <label for="searchInput">Schüler suchen</label>
      </div>
    </div>

    <!-- Button: Neuen Schüler anlegen -->
    <div class="button-row">
      <a
        href="#modalAddStudent"
        class="waves-effect waves-light btn green modal-trigger add-btn"
      >
        Neuen Schüler anlegen
      </a>
    </div>

    <!-- Liste der Schüler (statt 'table') -->
    <div class="students-list">
      <div
        v-for="student in filteredStudents"
        :key="student.id"
        class="row student-row"
      >
        <!-- Jede "Zeile" ein .row, jedes Feld ein .col s12 m2 etc. -->
        <div class="col s12 m2">
          <strong>Nachname:</strong> <br /> {{ student.lastName }}
        </div>
        <div class="col s12 m2">
          <strong>Vorname:</strong> <br /> {{ student.firstName }}
        </div>
        <div class="col s12 m3">
          <strong>Schülerkennzahl:</strong> <br /> {{ student.schuelerkennzahl }}
        </div>
        <div class="col s12 m2">
          <strong>Klasse:</strong> <br /> {{ student.classroom }}
        </div>
        <div class="col s12 m3">
          <button
            class="waves-effect waves-light btn modal-trigger green mr-1"
            href="#modalEditStudent"
            @click="openEditModal(student)"
          >
            Bearbeiten
          </button>
          <button
            class="waves-effect waves-light btn red"
            @click="confirmDelete(student)"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Neuen Schüler anlegen -->
    <div id="modalAddStudent" class="modal">
      <div class="modal-content">
        <h5>Neuen Schüler anlegen</h5>

        <div class="row">
          <div class="input-field col s12 m6">
            <input
              id="vorname"
              v-model="newStudentVorname"
              type="text"
              required
            />
            <label for="vorname">Vorname</label>
          </div>
          <div class="input-field col s12 m6">
            <input
              id="nachname"
              v-model="newStudentNachname"
              type="text"
              required
            />
            <label for="nachname">Nachname</label>
          </div>
        </div>

        <div class="row">
          <div class="input-field col s12 m6">
            <input
              id="schuelerkennzahl"
              v-model="newStudentSchuelerkennzahl"
              type="text"
              required
            />
            <label for="schuelerkennzahl">Schülerkennzahl</label>
          </div>
          <div class="input-field col s12 m6 dropdown-area">
            <select v-model="selectedClassroomId" required>
              <option disabled value="">Bitte wählen</option>
              <option
                v-for="c in allClassrooms"
                :key="c.id"
                :value="c.id"
              >
                {{ c.name }}
              </option>
            </select>
            <label>Klasse</label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <a
          href="#!"
          class="modal-close waves-effect btn grey mr-1"
        >
          Abbrechen
        </a>
        <a
          href="#!"
          class="modal-close waves-effect btn green btnmodal"
          @click.prevent="createStudent"
        >
          Anlegen
        </a>
      </div>
    </div>

    <!-- Modal: Bearbeiten -->
    <div id="modalEditStudent" class="modal">
      <div class="modal-content">
        <h5>Schüler bearbeiten</h5>
        <div class="row">
          <div class="input-field col s12 m6">
            <input
              id="editVorname"
              type="text"
              v-model="editStudentVorname"
              required
            />
            <label for="editVorname" class="active">Vorname</label>
          </div>
          <div class="input-field col s12 m6">
            <input
              id="editNachname"
              type="text"
              v-model="editStudentNachname"
              required
            />
            <label for="editNachname" class="active">Nachname</label>
          </div>
        </div>

        <div class="row">
          <div class="input-field col s12 m6">
            <input
              id="editKennzahl"
              type="text"
              v-model="editStudentKennzahl"
              required
            />
            <label for="editKennzahl" class="active">Schülerkennzahl</label>
          </div>
          <div class="input-field col s12 m6 dropdown-area">
            <select v-model="editSelectedClassroomId" required>
              <option disabled value="">Bitte wählen</option>
              <option
                v-for="c in allClassrooms"
                :key="c.id"
                :value="c.id"
              >
                {{ c.name }}
              </option>
            </select>
            <label>Klasse</label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <a
          href="#!"
          class="modal-close waves-effect btn grey btnmodal"
        >
          Abbrechen
        </a>
        <a
          href="#!"
          class="modal-close waves-effect btn green btnmodal"
          @click.prevent="updateStudent"
        >
          Speichern
        </a>
      </div>
    </div>

    <!-- Delete-Modal (eigenes Overlay) -->
    <div v-if="deleteModalOpen" class="custom-overlay">
      <div class="custom-modal">
        <h5>Löschen bestätigen</h5>
        <p>
          Bist du sicher, dass du den Schüler
          <strong>{{ studentToDelete?.lastName }} {{ studentToDelete?.firstName }}</strong>
          löschen möchtest?
        </p>
        <div class="modal-actions">
          <button class="waves-effect btn grey mr-1" @click="cancelDelete">
            Abbrechen
          </button>
          <button class="waves-effect btn red" @click="deleteStudentNow">
            Löschen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, nextTick } from "vue";
import axios from "axios";
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";

// Declarations
declare const M: any;

interface StudentDto {
  id: number;
  firstName: string;
  lastName: string;
  schuelerkennzahl: string;
  classroom: string | null;
}

interface ClassroomOption {
  id: number;
  name: string;
}

export default defineComponent({
  name: "KvStudentManagement",
  setup() {
    const snackbar = useSnackbarStore();

    // State: Schüler
    const students = ref<StudentDto[]>([]);
    const searchTerm = ref("");

    // State: Klassen
    const allClassrooms = ref<ClassroomOption[]>([]);

    // Add Student
    const newStudentVorname = ref("");
    const newStudentNachname = ref("");
    const newStudentSchuelerkennzahl = ref("");
    const selectedClassroomId = ref<number | "">("");

    // Edit Student
    const editStudentId = ref<number | null>(null);
    const editStudentVorname = ref("");
    const editStudentNachname = ref("");
    const editStudentKennzahl = ref("");
    const editSelectedClassroomId = ref<number | "">("");

    // Delete
    const deleteModalOpen = ref(false);
    const studentToDelete = ref<StudentDto | null>(null);

    // Lifecycle
    onMounted(() => {
      // Materialize modal init
      const modalElems = document.querySelectorAll(".modal");
      M.Modal.init(modalElems);

      fetchStudents();
      fetchClassrooms();
    });

    // After we fill <select> options, re-init FormSelect
    function initMaterializeSelects() {
      const sel = document.querySelectorAll("select");
      M.FormSelect.init(sel, {
        dropdownOptions: {
          container: document.body,
          constrainWidth: false,
          coverTrigger: false,
        },
      });
    }

    async function fetchStudents() {
      try {
        const resp = await axios.get("/admin/getAllStudents");
        students.value = resp.data;
      } catch (error) {
        snackbar.push("Fehler beim Laden der Schüler: " + error);
      }
    }

    async function fetchClassrooms() {
      try {
        const resp = await axios.get("/admin/classrooms");
        allClassrooms.value = resp.data;
        nextTick(() => initMaterializeSelects());
      } catch (error) {
        snackbar.push("Fehler beim Laden der Klassen: " + error);
      }
    }

    // CREATE
    async function createStudent() {
      try {
        const body = {
          vorname: newStudentVorname.value,
          nachname: newStudentNachname.value,
          schuelerkennzahl: newStudentSchuelerkennzahl.value,
          classroomId: selectedClassroomId.value,
        };
        const resp = await axios.post("/admin/newStudent", body);
        if (resp.status === 200 || resp.status === 201) {
          snackbar.push("Schüler erfolgreich angelegt!");
          // Reset
          newStudentVorname.value = "";
          newStudentNachname.value = "";
          newStudentSchuelerkennzahl.value = "";
          selectedClassroomId.value = "";
          fetchStudents();
        }
      } catch (error: any) {
        snackbar.push("Fehler beim Anlegen: " + (error.response?.data ?? error));
      }
    }

    // EDIT
    function openEditModal(student: StudentDto) {
      editStudentId.value = student.id;
      editStudentVorname.value = student.firstName;
      editStudentNachname.value = student.lastName;
      editStudentKennzahl.value = student.schuelerkennzahl;
      const matched = allClassrooms.value.find(
        (c) => c.name === student.classroom
      );
      editSelectedClassroomId.value = matched ? matched.id : "";

      nextTick(() => initMaterializeSelects());
    }

    async function updateStudent() {
      if (!editStudentId.value) return;
      try {
        const body = {
          id: editStudentId.value,
          vorname: editStudentVorname.value,
          nachname: editStudentNachname.value,
          schuelerkennzahl: editStudentKennzahl.value,
          classroomId: editSelectedClassroomId.value,
        };
        const resp = await axios.put("/admin/updateStudent", body);
        if (resp.status === 200) {
          snackbar.push("Schüler aktualisiert!");
          fetchStudents();
        }
      } catch (error: any) {
        snackbar.push(
          "Fehler beim Aktualisieren: " + (error.response?.data ?? error)
        );
      }
    }

    // DELETE
    function confirmDelete(student: StudentDto) {
      studentToDelete.value = student;
      deleteModalOpen.value = true;
    }
    function cancelDelete() {
      deleteModalOpen.value = false;
      studentToDelete.value = null;
    }
    async function deleteStudentNow() {
      if (!studentToDelete.value) return;
      try {
        await axios.delete(
          `/admin/deleteStudent/${studentToDelete.value.schuelerkennzahl}`
        );
        snackbar.push("Schüler erfolgreich gelöscht.");
        deleteModalOpen.value = false;
        studentToDelete.value = null;
        fetchStudents();
      } catch (error) {
        snackbar.push("Fehler beim Löschen: " + error);
      }
    }

    // Filter: nur by name, kennzahl, class
    const filteredStudents = computed(() => {
      if (!searchTerm.value.trim()) return students.value;
      const lower = searchTerm.value.toLowerCase();
      return students.value.filter((st) => {
        const fullName = (st.lastName + " " + st.firstName).toLowerCase();
        const revName = (st.firstName + " " + st.lastName).toLowerCase();
        const kl = st.classroom ? st.classroom.toLowerCase() : "";
        return (
          st.lastName.toLowerCase().includes(lower) ||
          st.firstName.toLowerCase().includes(lower) ||
          st.schuelerkennzahl.toLowerCase().includes(lower) ||
          fullName.includes(lower) ||
          revName.includes(lower) ||
          kl.includes(lower)
        );
      });
    });

    return {
      students,
      searchTerm,
      allClassrooms,

      newStudentVorname,
      newStudentNachname,
      newStudentSchuelerkennzahl,
      selectedClassroomId,

      editStudentId,
      editStudentVorname,
      editStudentNachname,
      editStudentKennzahl,
      editSelectedClassroomId,

      deleteModalOpen,
      studentToDelete,

      filteredStudents,

      initMaterializeSelects,
      fetchStudents,
      fetchClassrooms,
      createStudent,
      openEditModal,
      updateStudent,
      confirmDelete,
      cancelDelete,
      deleteStudentNow,
    };
  },
});
</script>

<style scoped>
/* Container */
.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}

/* Überschrift */
.title {
  margin-bottom: 30px;
  text-align: center;
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

/* Liste der Schüler => anstatt table */
.students-list {
  margin-bottom: 30px;
}
.student-row {
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
}
.student-row:last-child {
  border-bottom: none;
}

/* Buttons spacing */
.mr-1 {
  margin-right: 8px !important;
}
.action-btn {
  margin-left: 10px;
}

/* Dropdown extra bottom space */
.dropdown-area {
  margin-bottom: 50px; /* Extra space */
}

/* Materialize-Select scroll fix */
.dropdown-content.select-dropdown {
  max-height: 300px !important;
  overflow-y: auto !important;
}

/* Custom overlay for Delete Confirm */
.custom-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.custom-modal {
  background: #fff;
  padding: 20px 30px;
  border-radius: 6px;
  max-width: 400px;
  width: 90%;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
