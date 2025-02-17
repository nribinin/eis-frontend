<template>
  <div class="page-container">
    <!-- Suchfeld -->
    <div class="row search-row">
      <div class="input-field col s12 m8 offset-m2">
        <i class="material-icons prefix">search</i>
        <input id="searchInput" type="text" v-model="searchTerm" />
        <label for="searchInput">Schüler suchen</label>
      </div>
    </div>

    <!-- Button: Neuen Schüler anlegen -->
    <div class="button-row">
      <button
            class="waves-effect waves-light btn green add-btn"
            @click="openAddModal()"
          >
            Neuen Schüler anlegen
          </button>
    </div>

    <!-- Liste der Schüler (statt 'table') -->
    <div class="students-list">
      <div
        v-for="student in filteredStudents"
        :key="student.id"
        class="row student-row"
      >
        <div class="col s12 m2">
          <strong>Nachname:</strong> <br /> {{ student.lastName }}
        </div>
        <div class="col s12 m2">
          <strong>Vorname:</strong> <br /> {{ student.firstName }}
        </div>
        <div class="col s12 m3">
          <strong>Schülerkennzahl:</strong> <br /> {{ student.studentKennzahl }}
        </div>
        <div class="col s12 m2">
          <strong>Klasse:</strong> <br /> {{ student.hitclass }}
        </div>
        <div class="col s12 m3">
          <button
            class="waves-effect waves-light btn modal-trigger amber mr-1"
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
              id="studentKennzahl"
              v-model="newStudentStudentKennzahl"
              type="text"
              required
            />
            <label for="studentKennzahl">Schülerkennzahl</label>
          </div>
          <div class="input-field col s12 m6 dropdown-area">
            <select v-model="selectedHitclassId" required>
              <option disabled value="">Bitte wählen</option>
              <option
                v-for="c in allHitclasses"
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
            <select v-model="editSelectedHitclassId" required>
              <option disabled value="">Bitte wählen</option>
              <option
                v-for="c in allHitclasses"
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
          class="modal-close waves-effect btn grey btnmodal mr-1"
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

    <!-- Modal: Schüler löschen bestätigen -->
    <div id="modalDelete" class="modal">
      <div class="modal-content">
        <h5>Löschen bestätigen</h5>
        <p>
          Bist du sicher, dass du den Schüler
          <strong>{{ studentToDelete?.lastName }} {{ studentToDelete?.firstName }}</strong>
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
          @click="deleteStudentNow"
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

// Declarations
declare const M: any;

interface StudentDto {
  id: number;
  firstName: string;
  lastName: string;
  studentKennzahl: string;
  hitclass: string | null;
}

interface HitclassOption {
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
    const allHitclasses = ref<HitclassOption[]>([]);

    // Add Student
    const newStudentVorname = ref("");
    const newStudentNachname = ref("");
    const newStudentStudentKennzahl = ref("");
    const selectedHitclassId = ref<number | "">("");

    // Edit Student
    const editStudentId = ref<number | null>(null);
    const editStudentVorname = ref("");
    const editStudentNachname = ref("");
    const editStudentKennzahl = ref("");
    const editSelectedHitclassId = ref<number | "">("");

    // Delete
    const studentToDelete = ref<StudentDto | null>(null);

    // Lifecycle
    onMounted(() => {
      // Materialize modal init
      const modalElems = document.querySelectorAll(".modal");
      M.Modal.init(modalElems);

      fetchStudents();
      fetchHitclasses();
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

    async function fetchHitclasses() {
      try {
        const resp = await axios.get("/admin/hitclasses");
        allHitclasses.value = resp.data;
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
          studentKennzahl: newStudentStudentKennzahl.value,
          hitclassId: selectedHitclassId.value,
        };
        const resp = await axios.post("/admin/newStudent", body);
        if (resp.status === 200 || resp.status === 201) {
          snackbar.push("Schüler erfolgreich angelegt!");
          // Reset
          newStudentVorname.value = "";
          newStudentNachname.value = "";
          newStudentStudentKennzahl.value = "";
          selectedHitclassId.value = "";
          fetchStudents();
        }
      } catch (error: any) {
        snackbar.push(
          "Fehler beim Anlegen: " +
            (error.response?.data ?? error)
        );
      }
    }

    // EDIT
    function openEditModal(student: StudentDto) {
      editStudentId.value = student.id;
      editStudentVorname.value = student.firstName;
      editStudentNachname.value = student.lastName;
      editStudentKennzahl.value = student.studentKennzahl;
      const matched = allHitclasses.value.find(
        (c) => c.name === student.hitclass
      );
      editSelectedHitclassId.value = matched ? matched.id : "";
      nextTick(() => initMaterializeSelects());

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

    async function updateStudent() {
      if (!editStudentId.value) return;
      try {
        const body = {
          id: editStudentId.value,
          vorname: editStudentVorname.value,
          nachname: editStudentNachname.value,
          studentKennzahl: editStudentKennzahl.value,
          hitclassId: editSelectedHitclassId.value,
        };
        const resp = await axios.put("/admin/updateStudent", body);
        if (resp.status === 200) {
          snackbar.push("Schüler aktualisiert!");
          fetchStudents();
        }
      } catch (error: any) {
        snackbar.push(
          "Fehler beim Aktualisieren: " +
            (error.response?.data ?? error)
        );
      }
    }

    function openAddModal() {
      // Materialize Modal #modalEditTeacher öffnen
      const elem = document.getElementById("modalAddStudent");
      if (elem) {
        const instance = M.Modal.getInstance(elem);
        instance.open();
      }

      nextTick(() => initMaterializeSelects());
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

    // DELETE
    function confirmDelete(student: StudentDto) {
      studentToDelete.value = student;
      const elem = document.getElementById("modalDelete");
      const instance = M.Modal.getInstance(elem);
      instance.open();
    }
    function cancelDelete() {
      studentToDelete.value = null;
    }
    async function deleteStudentNow() {
      if (!studentToDelete.value) return;
      try {
        await axios.delete(
          `/admin/deleteStudent/${studentToDelete.value.studentKennzahl}`
        );
        snackbar.push("Schüler erfolgreich gelöscht.");
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
        const kl = st.hitclass ? st.hitclass.toLowerCase() : "";
        return (
          st.lastName.toLowerCase().includes(lower) ||
          st.firstName.toLowerCase().includes(lower) ||
          st.studentKennzahl.toLowerCase().includes(lower) ||
          fullName.includes(lower) ||
          revName.includes(lower) ||
          kl.includes(lower)
        );
      });
    });

    return {
      students,
      searchTerm,
      allHitclasses,
      newStudentVorname,
      newStudentNachname,
      newStudentStudentKennzahl,
      selectedHitclassId,
      editStudentId,
      editStudentVorname,
      editStudentNachname,
      editStudentKennzahl,
      editSelectedHitclassId,
      studentToDelete,
      filteredStudents,
      initMaterializeSelects,
      fetchStudents,
      fetchHitclasses,
      createStudent,
      openEditModal,
      updateStudent,
      confirmDelete,
      cancelDelete,
      deleteStudentNow,
      openAddModal,
    };
  },
});
</script>

<style scoped>
/* Rounded corners for Materialize modals */
.modal {
  border-radius: 10px !important;
  overflow: hidden;
}

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
.action-btn {
  margin-left: 10px;
}

/* Dropdown extra bottom space */
.dropdown-area {
  margin-bottom: 50px; /* Extra space */
}

@media only screen and (max-width: 600px) {
  /* Modal-Größe und Position anpassen */
  .modal {
    width: 90% !important;
    max-height: 90% !important;
    /* Damit bei Bedarf gescrollt werden kann */
    overflow-y: auto !important;
  }
  
}

</style>
