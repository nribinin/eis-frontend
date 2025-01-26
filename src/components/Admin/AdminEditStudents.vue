<template>
  <div class="student-container">
    <div class="create-student-section">
      <h3>Neuen Schüler anlegen</h3>
      <form @submit.prevent="createStudent" class="new-student-form">
        <div>
          <label for="vorname">Vorname:</label>
          <input
            type="text"
            id="vorname"
            v-model="newStudentVorname"
            required
          />
        </div>
        <div>
          <label for="nachname">Nachname:</label>
          <input
            type="text"
            id="nachname"
            v-model="newStudentNachname"
            required
          />
        </div>
        <div>
          <label for="schuelerkennzahl">Schülerkennzahl:</label>
          <input
            type="text"
            id="schuelerkennzahl"
            v-model="newStudentSchuelerkennzahl"
            required
          />
        </div>
        <div>
          <label for="classroom-select">Klasse:</label>
          <select id="classroom-select" v-model="selectedClassroomId" required>
            <option disabled value="">Bitte wählen</option>
            <option v-for="c in allClassrooms" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
        <button type="submit" class="btn waves-effect green">
          Schüler anlegen
        </button>
      </form>
    </div>
    <!-- Suchfeld -->
    <div class="search-section">
      <label for="searchInput">Suchen:</label>
      <input
        id="searchInput"
        type="text"
        v-model="searchTerm"
        placeholder="Nachname, Vorname, Kennzahl oder Klasse..."
      />
    </div>

    <!-- Tabelle der Schüler -->
    <table class="styled-table">
      <thead>
        <tr>
          <th>Nachname</th>
          <th>Vorname</th>
          <th>Schülerkennzahl</th>
          <th>Klasse</th>
          <th>Aktion</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in filteredStudents" :key="student.id">
          <td>{{ student.firstName }}</td>
          <td>{{ student.lastName }}</td>
          <td>{{ student.schuelerkennzahl }}</td>
          <td>{{ student.classroom }}</td>
          <td>
            <button
              class="btn waves-effect red"
              @click="deleteStudent(student.schuelerkennzahl)"
            >
              Löschen
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick } from "vue";
import axios from "axios";
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";
const snackbar = useSnackbarStore();

declare const M: any;

interface StudentDto {
  firstName: string;
  lastName: string;
  schuelerkennzahl: string;
  classroom: string | null; // falls kein Classroom
  id: number;
}

interface ClassroomOption {
  id: number;
  name: string;
}

export default defineComponent({
  name: "KvStudentManagement",
  setup() {
    // States
    const students = ref<StudentDto[]>([]);
    const searchTerm = ref<string>("");

    // Neuer Schüler
    const newStudentVorname = ref("");
    const newStudentNachname = ref("");
    const newStudentSchuelerkennzahl = ref("");
    const selectedClassroomId = ref<number | "">("");

    const allClassrooms = ref<ClassroomOption[]>([]);

    onMounted(async () => {
      await fetchStudents();
      await fetchAllClassrooms();
    });

    async function fetchStudents() {
      try {
        const response = await axios.get("/admin/getAllStudents");
        students.value = response.data;
      } catch (error) {
        snackbar.push("Fehler beim Laden der Schüler: " + error);
      }
    }
    async function fetchAllClassrooms() {
      try {
        const response = await axios.get("/admin/classrooms");
        allClassrooms.value = response.data;
        await nextTick();
        initializeSelect();
      } catch (error) {
        snackbar.push("Fehler beim Laden der Klassen: " + error);
      }
    }
    function initializeSelect() {
      const elems = document.querySelectorAll("select");
      M.FormSelect.init(elems);
    }

    async function createStudent() {
      try {
        const requestBody = {
          vorname: newStudentVorname.value,
          nachname: newStudentNachname.value,
          schuelerkennzahl: newStudentSchuelerkennzahl.value,
          classroomId: selectedClassroomId.value,
        };

        const response = await axios.post("/admin/newStudent", requestBody, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.status === 201) {
          window.location.reload();
        }
      } catch (error: any) {
        snackbar.push(
          "Fehler beim Anlegen des Schülers: " + error.response.data
        );
      }
    }

    async function deleteStudent(studentSchuelerkennzahl: string) {
      try {
        // Aufruf mit passender URL (Pfad anpassen, falls du Param schickst)
        await axios.delete(`/admin/deleteStudent/${studentSchuelerkennzahl}`, {
          // falls du CSRF oder mitCredentials brauchst, setze es hier
        });

        // Nach dem Löschen: Schülerliste neu laden
        await fetchStudents();
      } catch (error) {
        snackbar.push("Fehler beim Anlegen des Schülers: " + error);
      }
    }

    /**
     * Computed: Filtert die Schülerliste basierend auf searchTerm
     */
    const filteredStudents = computed(() => {
      if (!searchTerm.value.trim()) {
        return students.value;
      }

      const lower = searchTerm.value.toLowerCase();

      return students.value.filter((student) => {
        const fullName = (
          student.lastName +
          " " +
          student.firstName
        ).toLowerCase();
        const reverseName = (
          student.firstName +
          " " +
          student.lastName
        ).toLowerCase();
        const klassenzimmer = student.classroom
          ? student.classroom.toLowerCase()
          : "";

        return (
          student.lastName.toLowerCase().includes(lower) ||
          student.firstName.toLowerCase().includes(lower) ||
          student.schuelerkennzahl.toLowerCase().includes(lower) ||
          fullName.includes(lower) ||
          reverseName.includes(lower) ||
          klassenzimmer.includes(lower)
        );
      });
    });

    return {
      // States
      students,
      searchTerm,

      newStudentVorname,
      newStudentNachname,
      newStudentSchuelerkennzahl,
      selectedClassroomId,
      allClassrooms,

      // Computed
      filteredStudents,

      // Methods
      fetchStudents,
      fetchAllClassrooms,
      createStudent,
      deleteStudent,
    };
  },
});
</script>

<style scoped>
.student-container {
  max-width: 1200px;
  margin: 40px auto;
  background-color: #f4f4f9;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-section {
  margin-bottom: 20px;
}

.search-section input {
  padding: 8px;
  font-size: 16px;
  width: 300px;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 16px;
  font-family: "Arial", sans-serif;
}

.styled-table thead tr {
  background-color: #343a40;
  color: white;
}

.styled-table th,
.styled-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #f9f9f9;
}

.styled-table tbody tr:hover {
  background-color: #f1f1f1;
}

.create-student-section {
  margin-top: 30px;
  text-align: left;
  background-color: #fff;
  padding: 20px;
  border-radius: 6px;
}

.new-student-form {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 500px;
}

.new-student-form label {
  margin-top: 10px;
  font-weight: bold;
}

.new-student-form input,
.new-student-form select {
  margin-top: 5px;
  padding: 6px;
  font-size: 14px;
}

.new-student-form button.create-student-btn {
  background-color: #28a745;
  color: white;
  margin-top: 15px;
  padding: 8px 14px;
}

.status-message {
  margin-top: 10px;
  font-weight: bold;
  font-size: 16px;
}

.status-message.success {
  color: #28a745;
}

.status-message.error {
  color: #dc3545;
}
</style>
