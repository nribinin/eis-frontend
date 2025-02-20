<!-- SchuelerTable.vue -->
<template>
  <div class="schuelerTable modern-container">
    <template v-if="subjectList.length === 0">
      <p class="no-data-message">Kein Lehrer hat dich noch bewertet</p>
    </template>
    <template v-else>
      <!-- Wrapper für vertikales Scrollen -->
      <div class="table-vertical-scroll">
        <table class="modern-table">
          <thead class="modern-thead">
            <tr>
              <th class="col">
                <div class="icontext">
                  <i class="material-icons">school</i> Gegenstand
                </div>
              </th>
              <th class="col">
                <div class="icontext">
                  <i class="material-icons">person</i> Lehrer
                </div>
              </th>
              <th class="col">
                <div class="icontext">
                  <i class="material-icons">insert_invitation</i> Datum
                </div>
              </th>
              <th class="col">
                <div class="icontext">
                  <i class="material-icons">subject</i> Anmerkung
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(group, index) in groupedSubjectList" :key="index">
              <tr
                v-if="group.length > 1"
                :class="[
                  'group-row',
                  getGroupRowClass(group),
                  { 'selected-group': expandedGroups.includes(index) }
                ]"
                @click="toggleGroup(index)"
              >
                <td>
                  <!-- Icon und Label zur Kennzeichnung von Gruppierungen -->
                  <i class="material-icons group-icon">
                    {{ expandedGroups.includes(index) ? "folder_open" : "folder" }}
                  </i>
                  <span class="group-label">Gruppe</span>
                  {{ group[0].subjectLangbezeichnung }}
                  <!-- Dropdown-Icons -->
                  <img
                    v-if="getGroupRowClass(group) === 'rowblack' && !expandedGroups.includes(index)"
                    src="@/assets/arrowDown_White.png"
                    alt="dropdown icon"
                    class="dropdown-icon"
                  />
                  <img
                    v-if="getGroupRowClass(group) === 'rowblack' && expandedGroups.includes(index)"
                    src="@/assets/arrowUp_White.png"
                    alt="dropdown icon"
                    class="dropdown-icon"
                  />
                  <img
                    v-else-if="!expandedGroups.includes(index)"
                    src="@/assets/arrowDown.png"
                    alt="dropdown icon"
                    class="dropdown-icon"
                  />
                  <img
                    v-else-if="expandedGroups.includes(index)"
                    src="@/assets/arrowUp.png"
                    alt="dropdown icon"
                    class="dropdown-icon"
                  />
                </td>
                <td colspan="3"></td>
              </tr>
              <template v-if="expandedGroups.includes(index)">
                <tr
                  v-for="subject in group"
                  :key="subject.ampelId"
                  :class="['data-row', getRowClass(subject), 'child-row']"
                >
                  <td>{{ subject.subjectLangbezeichnung }}</td>
                  <td>{{ subject.teacherName }}</td>
                  <td>{{ formatDate(subject.updatedAt) || "Kein Datum" }}</td>
                  <td>{{ subject.bemerkung || "Keine Bemerkung" }}</td>
                </tr>
              </template>
            </template>
            <tr
              v-for="subject in singleSubjectList"
              :key="subject.ampelId"
              :class="['data-row', getRowClass(subject)]"
            >
              <td>{{ subject.subjectLangbezeichnung }}</td>
              <td>{{ subject.teacherName }}</td>
              <td>{{ formatDate(subject.updatedAt) || "Kein Datum" }}</td>
              <td>{{ subject.bemerkung || "Keine Bemerkung" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { format } from "date-fns";
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";
const snackbar = useSnackbarStore();
 import testdata from "@/assets/testdaten.json";

interface Subject {
  ampelId: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  subjectKurzbezeichnung: string;
  subjectLangbezeichnung: string;
  gegenstandsart: string;
  hitclassName: string;
  farbe: string;
  bemerkung: string | null;
  updatedAt: string | null;
  lessonId: number;
}

const subjectList = ref<Subject[]>([]);
const expandedGroups = ref<number[]>([]);

const fetchSubjects = async () => {
  try {
    const response = await axios.get("/student-ampel/getSchueler");
    subjectList.value = response.data;
    // Für Testdaten: 
    //subjectList.value = testdata;
  } catch (error) {
    snackbar.push(
      "Fehler beim Laden deiner Ampeln. Melde dich bitte beim Systemadministrator!"
    );
  }
};

const filteredSubjects = computed(() => {
  return subjectList.value.filter((subject) => subject.farbe !== "GRAU");
});

const groupedSubjectList = computed(() => {
  const grouped = filteredSubjects.value.reduce((acc: Subject[][], subject) => {
    const group = acc.find(
      (g) => g[0].subjectLangbezeichnung === subject.subjectLangbezeichnung
    );
    if (group) {
      group.push(subject);
    } else {
      acc.push([subject]);
    }
    return acc;
  }, []);
  return grouped.filter((group) => group.length > 1);
});

const singleSubjectList = computed(() => {
  const groupedSubjects = groupedSubjectList.value
    .flat()
    .map((entry) => entry.subjectLangbezeichnung);
  return filteredSubjects.value.filter(
    (subject) => !groupedSubjects.includes(subject.subjectLangbezeichnung)
  );
});

const toggleGroup = (index: number) => {
  if (expandedGroups.value.includes(index)) {
    expandedGroups.value = expandedGroups.value.filter((i) => i !== index);
  } else {
    expandedGroups.value.push(index);
  }
};

const getRowClass = (subject: Subject) => {
  switch (subject.farbe) {
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
};

const getGroupRowClass = (group: Subject[]) => {
  const colors = group.map((item) => item.farbe);
  if (colors.includes("SCHWARZ")) return "rowblack";
  if (colors.includes("ROT")) return "rowred";
  if (colors.includes("GELB")) return "rowyellow";
  if (colors.includes("GRUEN")) return "rowgreen";
  return "";
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  return format(new Date(dateString), "dd.MM.yyyy HH:mm");
};

onMounted(fetchSubjects);
</script>

<style scoped>
/* Container mit modernem Hintergrund, abgerundeten Ecken und Schatten */
.modern-container {
  padding: 20px;
  background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* Wrapper für vertikales Scrollen */
.table-vertical-scroll {
  max-height: 70vh; /* Passt die Höhe je nach Bedarf an */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* für flüssiges Scrollen auf iOS */
}

/* Modernes Tabellendesign */
.modern-table {
  border-radius: 10px;
  width: 100%;
  border-collapse: separate; /* oder collapse, je nach gewünschtem Effekt */
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Tabellenkopf mit Farbverlauf */
.modern-thead {
  background: linear-gradient(90deg, #4b79a1, #283e51);
  color: #fff;
}

.modern-thead th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  font-size: 1.1em;
}

/* Allgemeine Zellgestaltung */
th,
td {
  padding: 15px 20px;
  border: none;
  border-radius: 0;
  margin: 0;
  list-style: none;
}

/* Zeilenstile und Hover-Effekte */
.data-row,
.group-row {
  transition: background-color 0.3s, transform 0.3s;
  cursor: pointer;
}

.data-row:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.01);
}

.group-row {
  font-weight: bold;
}

.group-row:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.01);
}

/* Farbeffekte für die Zeilen */
.rowgreen {
  background-color: #009640 !important;
  color: #fff;
}

.rowyellow {
  background-color: #ffc107 !important;
  color: #333;
}

.rowred {
  background-color: #e30613 !important;
  color: #fff;
}

.rowblack {
  background-color: #000 !important;
  color: #fff;
}

/* Border für ausgeklappte Gruppen */
.selected-group {
  border: 1px solid #007bff;
  border-radius: 4px;
}

/* Einrückung und Border für ausgeklappte Kindzeilen */
.child-row td:first-child {
  padding-left: 170px;
}

.child-row {
  border-left: 3px solid #007bff;
}

/* Styling für Gruppenkennzeichnung */
.group-icon {
  font-size: 20px;
  vertical-align: middle;
  margin-right: 5px;
  opacity: 0.8;
}

.group-label {
  background-color: rgba(0, 123, 255, 0.2);
  color: #007bff;
  border-radius: 3px;
  padding: 2px 4px;
  margin-right: 5px;
  font-size: 0.8em;
}

/* Styling für Icon und Text im Header */
.icontext {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-icon {
  width: 18px;
  margin-left: 10px;
  transition: transform 0.3s;
}

.group-row:hover .dropdown-icon {
  transform: scale(1.1);
}

/* Meldung bei fehlenden Daten */
.no-data-message {
  text-align: center;
  font-size: 1.5em;
  margin-top: 2em;
  color: #555;
}

/* Responsive Anpassungen */
@media (max-width: 768px) {
  .modern-thead th,
  td {
    padding: 10px;
    font-size: 0.9rem;
  }
  .icontext {
    font-size: 0.9rem;
  }
}
</style>