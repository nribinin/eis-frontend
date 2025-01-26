<template>
    <div class="teacher-container">  
      <!-- Neues Formular: Lehrer anlegen -->
      <div class="create-teacher-section">
        <center><h3>Neuen Lehrer anlegen</h3></center>
        <form @submit.prevent="createTeacher" class="new-teacher-form">
          <!-- Name -->
          <div>
            <label for="teacherName">Name:</label>
            <input
              type="text"
              id="teacherName"
              v-model="newTeacherName"
              required
            />
          </div>
  
          <!-- Multi-Select: Zuordnung zu Lessons -->
          <div>
            <label for="lessonSelect">Unterrichtseinheiten (Lessons) auswählen:</label>
            <select
              id="lessonSelect"
              multiple
              v-model="selectedLessonIds"
            >
              <option
                v-for="lesson in lessons"
                :key="lesson.id"
                :value="lesson.id"
              >
                {{ lesson.classRoomName }} - {{ lesson.subjectName }}
              </option>
            </select>
          </div>
  
          <button type="submit" class="btn waves-effect green">
            Lehrer anlegen
          </button>
        </form>
      </div>
  
      <!-- Suchfeld für Lehrer -->
      <div class="search-section">
        <label for="searchInput">Suchen (Name):</label>
        <input
          id="searchInput"
          type="text"
          v-model="searchTerm"
          placeholder="Lehrername"
        />
      </div>
  
      <!-- Tabelle der Lehrer -->
      <table class="styled-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="teacher in filteredTeachers" :key="teacher.id">
            <td>{{ teacher.name }}</td>
            <td>
              <button
                class="btn waves-effect red"
                @click="deleteTeacher(teacher.id)"
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
  import { useSnackbarStore } from "@/stores/SnackbarStore.ts"
  const snackbar = useSnackbarStore()

  declare const M: any;

  
  /**
   * TeacherDto => passend zu /api/admin/getAllTeachers
   * z. B. [{ id:1, name:"Max Mustermann" }, ... ]
   */
  interface TeacherDto {
    id: number;
    name: string;
  }
  
  /**
   * LessonsDto => passend zu /api/admin/getAllLessons
   * z. B. [{ id:1, classroomName:"5AHIT", subjectName:"Mathematik" }, ... ]
   */
  interface LessonDto {
    id: number;
    subjectName: string;
    classRoomName: string;
  }
  
  export default defineComponent({
    name: "TeacherManagement",
  
    setup() {
      // State: Lehrer
      const teachers = ref<TeacherDto[]>([]);
      const searchTerm = ref("");
      
      // Neuer Lehrer
      const newTeacherName = ref("");
      const selectedLessonIds = ref<number[]>([]);
  
      // Lessons für die Multi-Select
      const lessons = ref<LessonDto[]>([]);
  
      // Beim Laden: Lehrer + Lessons holen
      onMounted(async () => {
        await fetchTeachers();
        await fetchLessons();
      });
  
      /**
       * GET /api/admin/getAllTeachers
       * => List<TeacherDto> = [{id, name}, ...]
       */
      async function fetchTeachers() {
        try {
          const response = await axios.get("/api/admin/getAllTeachers");
          teachers.value = response.data;
        } catch (error) {
          snackbar.push("Fehler beim Laden der Lehrer: " + error);
        }
      }
  
      /**
       * GET /api/admin/getAllLessons
       * => List<LessonsDto> = [{id, classroomName, subjectName}, ...]
       */
      async function fetchLessons() {
        try {
          const response = await axios.get("/api/admin/getAllLessons");
          lessons.value = response.data;
          await nextTick() // Wait for DOM to update
          initializeSelect()
        } catch (error) {
          snackbar.push("Fehler beim Laden der Lessons: " + error);
        }
      }

      function initializeSelect() {
        const elems = document.querySelectorAll('select')
        M.FormSelect.init(elems)
      }
  
      /**
       * POST /api/admin/newTeacher
       * => Body: { name: string, lessonIds: number[] }
       *  Falls 201 => neu laden; Falls 409 => Lehrer existiert
       */
      async function createTeacher() {
  
        try {
          const body = {
            name: newTeacherName.value,
            lessonIds: selectedLessonIds.value
          };
  
          const response = await axios.post("/api/admin/newTeacher", body, {
            headers: {
              "Content-Type": "application/json"
            }
          });
  
          if (response.status === 201) {
            newTeacherName.value = "";
            selectedLessonIds.value = [];
            // Lehrer neu laden
            await fetchTeachers();
          } else {
            await fetchTeachers();
          }
        } catch (error: any) {
          snackbar.push("Fehler beim Anlegen des Lehrers: " + error.response.data);
        }
      }
  
      /**
       * DELETE /api/admin/deleteTeacher/{id}
       */
      async function deleteTeacher(teacherId: number) {
        try {
          await axios.delete(`/api/admin/deleteTeacher/${teacherId}`);
          // Neu laden
          await fetchTeachers();
        } catch (error) {
          snackbar.push("Fehler beim Löschen des Lehrers: " + error);
        }
      }
  
      /**
       * Computed: Filtert die Lehrer basierend auf searchTerm
       */
      const filteredTeachers = computed(() => {
        if (!searchTerm.value.trim()) {
          return teachers.value;
        }
        const lower = searchTerm.value.toLowerCase();
        return teachers.value.filter((t) =>
          t.name.toLowerCase().includes(lower)
        );
      });
  
      return {
        teachers,
        searchTerm,
        newTeacherName,
        selectedLessonIds,
        lessons,
  
        // Methods
        fetchTeachers,
        fetchLessons,
        createTeacher,
        deleteTeacher,
        // Computed
        filteredTeachers
      };
    }
  });
  </script>
  
  <style scoped>
  .teacher-container {
    max-width: 1200px;
    margin: 40px auto;
    background-color: #f4f4f9;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .create-teacher-section {
    margin-top: 30px;
    text-align: left;
    background-color: #fff;
    padding: 20px;
    border-radius: 6px;
  }
  
  .new-teacher-form {
    display: flex;
    flex-direction: column;
    width: 300px;
    margin: 0 auto;
  }
  
  .new-teacher-form div {
    margin-bottom: 10px;
  }
  
  .new-teacher-form label {
    font-weight: bold;
  }
  
  .new-teacher-form select {
    min-height: 100px; /* Damit man bei multiple-select mehr sieht */
  }
  
  .new-teacher-form button.create-teacher-btn {
    background-color: #28a745;
    color: white;
    margin-top: 15px;
    padding: 8px 14px;
  }
  
  .search-section {
    margin-top: 30px;
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
  