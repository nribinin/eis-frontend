<template>
  <div class="my-collapsible-container">
    <h2>Meine Schüler mit Ampeln</h2>

    <ul class="my-collapsible-list">
      <li
        v-for="(student, idx) in students"
        :key="student.studentId"
        class="my-collapsible-item"
      >
        <!-- Header zum Auf-/Zuklappen -->
        <div class="my-collapsible-header" @click="toggle(idx)">
          <h3>{{ student.studentName }}</h3>
          <i>{{ student.isOpen ? "▼" : "►" }}</i>
        </div>

        <!-- Body mit Transition -->
        <transition name="slide-fade">
          <div class="my-collapsible-body" v-if="student.isOpen">
            <!-- Falls keine Ampel-Einträge -->
            <div v-if="!student.ampelEntries || !student.ampelEntries.length">
              Keine Ampel-Einträge
            </div>

            <!-- Ansonsten kleine Tabelle -->
            <table v-else class="mini-table">
              <thead>
                <tr>
                  <th>Fach</th>
                  <th>Farbe</th>
                  <th>Bemerkung</th>
                  <th>Zuletzt geändert</th>
                  <th>Lehrer</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(ampel, aIndex) in student.ampelEntries"
                  :key="aIndex"
                  :class="rowClass(ampel.farbe)"
                >
                  <td>{{ ampel.subjectKurzbezeichnung }}</td>
                  <td>{{ ampel.farbe ?? "–" }}</td>
                  <td>{{ ampel.bemerkung ?? "Keine Bemerkung" }}</td>
                  <td>{{ formatDate(ampel.updatedAt) ?? "–" }}</td>
                  <td>{{ ampel.teacherName }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </transition>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { format } from "date-fns";
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";
const snackbar = useSnackbarStore();

/** AmpelDto */
interface AmpelDto {
  teacherId: number;
  teacherName: string;
  farbe: string | null;
  bemerkung: string | null;
  subjectKurzbezeichnung: string;
  updatedAt: string | null;
}

/** KvStudentAmpelDto */
interface KvStudentAmpelDto {
  studentId: number;
  studentName: string;
  studentKennzahl: string;
  ampelEntries: AmpelDto[];
  isOpen?: boolean;
}

const students = ref<KvStudentAmpelDto[]>([]);

// Lifecycle
onMounted(async () => {
  try {
    // Passe den Pfad an deinen tatsächlichen Backend-Mapping an
    // z. B. '/teacher-ampel/kv/getStudents'
    const resp = await axios.get("/teacher-ampel/kv/getStudents");
    if (!resp.data || (Array.isArray(resp.data) && resp.data.length === 0)) {
      snackbar.push(
        "Schüler konnten nicht geladen werden. Entweder bist du kein KV einer Klasse oder es gab einen Fehler."
      );
      return;
    }
    // 1) "resp.data" => Array<KvStudentAmpelDto>
    // 2) Sortieren nach studentName
    const sortedData = resp.data.sort(
      (a: KvStudentAmpelDto, b: KvStudentAmpelDto) => {
        // Kleinschreibung beider Namen, und dann localeCompare
        return a.studentName
          .toLowerCase()
          .localeCompare(b.studentName.toLowerCase());
      }
    );

    // 3) Mit .map(...) isOpen hinzufügen
    students.value = sortedData.map((s: KvStudentAmpelDto) => ({
      ...s,
      isOpen: false,
    }));
  } catch (error) {
    snackbar.push(
      "Fehler beim Laden der Schüler. Bitte wende dich an den Systemadministrator."
    );
  }
});

// Auf-/Zuklappen
function toggle(index: number) {
  students.value[index].isOpen = !students.value[index].isOpen;
}

/**
 * Zeilenfarbe bestimmen anhand ampel.farbe
 */
function rowClass(farbe: string | null): string {
  switch (farbe) {
    case "GRUEN":
      return "rowgreen";
    case "GELB":
      return "rowyellow";
    case "ROT":
      return "rowred";
    case "SCHWARZ":
      return "rowblack";
    default:
      return "";
  }
}

// Datum formatieren
function formatDate(dateString: string | null) {
  if (!dateString) return null;
  return format(new Date(dateString), "dd.MM.yyyy HH:mm");
}
</script>

<style scoped>
.my-collapsible-container {
  max-width: 800px;
  margin: 20px auto;
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
}
.my-collapsible-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.my-collapsible-item {
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
}
.my-collapsible-header {
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.my-collapsible-header h3 {
  margin: 0;
  font-size: 18px;
}
.my-collapsible-body {
  padding: 10px;
  border-top: 1px solid #ccc;
}
/* Minimale Tabelle für Ampel-Einträge */
.mini-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.mini-table thead tr {
  background-color: #f2f2f2;
}
.mini-table th,
.mini-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

/* Hintergrundfarben für Zeilen je nach Ampel-Farbe */
.rowgreen {
  background-color: #009640 !important;
  color: #fff !important;
}
.rowyellow {
  background-color: #ffc107 !important;
}
.rowred {
  background-color: #e30613 !important;
  color: white !important;
}
.rowblack {
  background-color: #333 !important;
  color: #fff !important;
}

/* Transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
