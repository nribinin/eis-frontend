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
              <th>
                <div class="icontext">
                  <i class="material-icons">school</i> Gegenstand
                </div>
              </th>
              <th>
                <div class="icontext">
                  <i class="material-icons">person</i> Lehrer
                </div>
              </th>
              <th>
                <div class="icontext">
                  <i class="material-icons">insert_invitation</i> Datum
                </div>
              </th>
              <th>
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
                data-label="Gruppe"
              >
                <td>
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
                  <td data-label="Gegenstand">{{ subject.subjectLangbezeichnung }}</td>
                  <td data-label="Lehrer">{{ subject.teacherName }}</td>
                  <td data-label="Datum">{{ formatDate(subject.updatedAt) || "Kein Datum" }}</td>
                  <td data-label="Anmerkung">{{ subject.bemerkung || "Keine Bemerkung" }}</td>
                </tr>
              </template>
            </template>
            <tr
              v-for="subject in singleSubjectList"
              :key="subject.ampelId"
              :class="['data-row', getRowClass(subject)]"
            >
              <td data-label="Gegenstand">{{ subject.subjectLangbezeichnung }}</td>
              <td data-label="Lehrer">{{ subject.teacherName }}</td>
              <td data-label="Datum">{{ formatDate(subject.updatedAt) || "Kein Datum" }}</td>
              <td data-label="Anmerkung">{{ subject.bemerkung || "Keine Bemerkung" }}</td>
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
    // const response = await axios.get("/student-ampel/getSchueler");
    // subjectList.value = response.data;
    // Für Testdaten:
    subjectList.value = testdata;
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
/* Container mit grauem Gradient (wie vorher) */
.modern-container {
  padding: 30px;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  transition: background 0.5s;
}

/* Vertikaler Scroll-Container */
.table-vertical-scroll {
  max-height: 70vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Tabelle & Header */
.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}
.modern-table:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  
}
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

th,
td {
  padding: 15px 20px;
  border: none;
}

/* Übergänge für Zeilen */
.data-row,
.group-row {
  transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}
.data-row:hover,
.group-row:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  transform: scale(1.02);
}

/* Neue, schönere Farbtöne */
.rowgreen {
  background-color: #388e3c !important;  /* edles Grün */
  color: #fff;
}
.rowyellow {
  background-color: #fbc02d !important;  /* warmes Gelb */
  color: #000;
}
.rowred {
  background-color: #d32f2f !important;   /* klassisches Rot */
  color: #fff;
}
.rowblack {
  background-color: #212121 !important;   /* dunkles Grau */
  color: #fff;
}

.selected-group {
  border: 2px solid #007bff;
  border-radius: 5px;
}

.child-row td:first-child {
  padding-left: 50px;
}

.group-icon {
  font-size: 22px;
  vertical-align: middle;
  margin-right: 5px;
  opacity: 0.9;
}
.group-label {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
  border-radius: 4px;
  padding: 2px 6px;
  margin-right: 8px;
  font-size: 0.85em;
}
.icontext {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dropdown-icon {
  width: 20px;
  margin-left: 10px;
  transition: transform 0.3s ease;
}
.group-row:hover .dropdown-icon {
  transform: scale(1.1);
}

.no-data-message {
  text-align: center;
  font-size: 1.5em;
  margin-top: 2em;
  color: #555;
}

/* Responsive Anpassungen für Mobile */
@media (max-width: 768px) {
  /* Alle Tabellenelemente als Block anzeigen */
  .modern-table,
  .modern-thead,
  .modern-table tbody,
  .modern-table tr,
  .modern-table th,
  .modern-table td {
    display: block;
  }
  .modern-thead {
    display: none;
  }
  /* Für ausgeklappte Data-Entries: Label fixiert links, Inhalt rechtsbündig */
  .data-row td {
    position: relative;
    padding: 12px 15px 12px 120px;
    text-align: right;
    border-bottom: 1px solid #eee;
  }
  .data-row td:before {
    position: absolute;
    left: 15px;
    top: 12px;
    width: 90px;
    font-weight: bold;
    white-space: nowrap;
    /* Labelfarbe übernimmt nun die Textfarbe */
    color: inherit;
    text-align: left;
  }
  .data-row td[data-label="Gegenstand"]:before {
    content: "Gegenstand:";
  }
  .data-row td[data-label="Lehrer"]:before {
    content: "Lehrer:";
  }
  .data-row td[data-label="Datum"]:before {
    content: "Datum:";
  }
  .data-row td[data-label="Anmerkung"]:before {
    content: "Anmerkung:";
  }
  /* Gruppierte Zeilen bleiben linksbündig ohne reservierten Label-Bereich */
  .group-row td {
    padding-left: 15px !important;
    text-align: left;
  }
  .group-row td:before {
    display: none;
  }
  .modern-container {
    padding: 15px;
  }
}
</style>
