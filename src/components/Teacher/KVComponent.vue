<template>
  <div class="my-collapsible-container">
    <h2>Meine Schüler mit Ampeln</h2>
    <!-- Eingabefeld zum Filtern nach Namen -->
    <input type="text" v-model="filter" placeholder="Namen filtern" />

    <!-- Checkbox um Farben anzuzeigen -->
    <div class="color-toggle">
      <input type="checkbox" id="colorToggle" v-model="showColoredTiles" />
      <label for="colorToggle" v-if="!showColoredTiles">Farben anzeigen</label>
      <label for="colorToggle" v-else>Farben ausblenden</label>
    </div>

    <ul class="my-collapsible-list">
      <li
        v-for="student in filteredStudents"
        :key="student.studentId"
        :class="getTileColor(student)"
        class="my-collapsible-item"
      >
        <!-- Header zum Auf-/Zuklappen -->
        <div class="my-collapsible-header" @click="toggle(student)">
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
                  v-for="(ampel, aIndex) in sortedAmpelEntries(student.ampelEntries)"
                  :key="aIndex"
                  :class="rowClass(ampel.farbe)"
                >
                  <td>{{ ampel.subjectLangbezeichnung }}</td>
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
import { ref, onMounted, computed } from "vue";
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
  subjectLangbezeichnung: string;
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

// Filter für die Schülernamen
const filter = ref("");

// Reactive variable to store the state of the checkbox
const showColoredTiles = ref(false);

// Computed-Property zum Filtern der Schüler basierend auf dem eingegebenen Filter
const filteredStudents = computed(() =>
  students.value.filter(student =>
    student.studentName.toLowerCase().includes(filter.value.toLowerCase())
  )
);

// Lifecycle
onMounted(async () => {
  try {
    const resp = await axios.get("/teacher-ampel/kv/getStudents");
    if (!resp.data || (Array.isArray(resp.data) && resp.data.length === 0)) {
      snackbar.push(
        "Schüler konnten nicht geladen werden. Entweder bist du kein KV einer Klasse oder es gab einen Fehler."
      );
      return;
    }

    const processedData = resp.data.map((student: KvStudentAmpelDto) => ({
      ...student,
      ampelEntries: student.ampelEntries.filter(entry => entry.farbe !== "GRAU"),
    }));

    const sortedData = processedData.sort(
      (a: KvStudentAmpelDto, b: KvStudentAmpelDto) => {
        return a.studentName
          .toLowerCase()
          .localeCompare(b.studentName.toLowerCase());
      }
    );

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
function toggle(student: KvStudentAmpelDto) {
  student.isOpen = !student.isOpen;
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

/**
 * Sortiert die Ampel-Einträge in der gewünschten Reihenfolge:
 * Schwarz, Rot, Gelb, Grün
 */
function sortedAmpelEntries(ampelEntries: AmpelDto[]): AmpelDto[] {
  const order: Record<string, number> = {
    SCHWARZ: 1,
    ROT: 2,
    GELB: 3,
    GRUEN: 4
  };
  return [...ampelEntries].sort(
    (a, b) => (order[a.farbe ?? ""] || 5) - (order[b.farbe ?? ""] || 5)
  );
}

/**
 * Bestimmt die Kachelfarbe basierend auf den Ampel-Einträgen des Schülers
 */
function getTileColor(student: KvStudentAmpelDto): string {
  if (!showColoredTiles.value) return '';

  const colors = student.ampelEntries.map(entry => entry.farbe);
  if (colors.includes('SCHWARZ')) return 'black-tile';
  if (colors.includes('ROT')) return 'red-tile';
  if (colors.includes('GELB')) return 'yellow-tile';
  if (colors.every(color => color === 'GRUEN')) return 'green-tile';
  return 'white-tile';
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
  color: black;
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

/* Hintergrundfarben für Kacheln je nach Ampel-Farbe */
.black-tile {
  background-color: black;
  color: white;
}
.red-tile {
  background-color: #e30613;
  color: white;
}
.yellow-tile {
  background-color: #ffa500;
  color: white;
}
.green-tile {
  background-color: #005c27;
  color: white;
}
.white-tile {
  background-color: white;
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

/* Angepasster Style für den Filter-Input */
input[type="text"] {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Add some styles for the checkbox */
.color-toggle {
  margin: 1em 0;
}
</style>