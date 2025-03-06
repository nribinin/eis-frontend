<template>
  <div class="schuelerTable modern-container">
    <template v-if="subjectList.length === 0">
      <p class="no-data-message">Kein Lehrer hat dich noch bewertet</p>
    </template>
    <template v-else>
      <!-- Desktop-Ansicht: klassische Tabelle -->
      <div v-if="!isMobile" class="table-vertical-scroll">
        <table class="modern-table">
          <thead class="modern-thead">
            <tr>
              <th>
                <div class="icontext">
                  <i class="material-icons">school</i> Gegenstand
                </div>
              </th>
              <th>
                <div class="icontext"><i class="material-icons">person</i> Lehrer</div>
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
                  { 'selected-group': expandedGroups.includes(index) },
                ]"
                @click="toggleGroup(index)"
                data-label="Gruppe"
              >
                <td style="padding-left: 40px">
                  <i class="material-icons group-icon">
                    {{ expandedGroups.includes(index) ? "folder_open" : "folder" }}
                  </i>

                  {{ group[0].subjectLangbezeichnung }}
                  <!-- Für Gruppen mit schwarzer oder grüner Kennzeichnung werden weiße Pfeile genutzt -->
                  <img
                    v-if="
                      (getGroupRowClass(group) === 'rowblack' ||
                        getGroupRowClass(group) === 'rowgreen') &&
                      !expandedGroups.includes(index)
                    "
                    src="@/assets/arrowDown_White.png"
                    alt="dropdown icon"
                    class="dropdown-icon"
                  />
                  <img
                    v-else-if="
                      (getGroupRowClass(group) === 'rowblack' ||
                        getGroupRowClass(group) === 'rowgreen') &&
                      expandedGroups.includes(index)
                    "
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
                    v-else
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
                  <td data-label="Datum">
                    {{ formatDate(subject.updatedAt) || "Kein Datum" }}
                  </td>
                  <td data-label="Anmerkung">
                    {{ subject.bemerkung || "Keine Bemerkung" }}
                  </td>
                </tr>
              </template>
            </template>
            <tr
              v-for="subject in singleSubjectList"
              :key="subject.ampelId"
              :class="['data-row', getRowClass(subject)]"
            >
              <td data-label="Gegenstand" style="padding-left: 70px">
                {{ subject.subjectLangbezeichnung }}
              </td>
              <td data-label="Lehrer">{{ subject.teacherName }}</td>
              <td data-label="Datum">
                {{ formatDate(subject.updatedAt) || "Kein Datum" }}
              </td>
              <td data-label="Anmerkung">{{ subject.bemerkung || "Keine Bemerkung" }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile-Ansicht: Cards -->
      <div v-else class="mobile-card-container">
        <!-- Gruppierte Fächer als einklappbare Cards mit eigenen Inner-Cards -->
        <div
          v-for="(group, index) in groupedSubjectList"
          :key="index"
          class="card card-group"
          :class="getGroupRowClass(group)"
        >
          <div class="card-header" @click="toggleGroup(index)">
            <span class="card-title">Gruppe: {{ group[0].subjectLangbezeichnung }}</span>
            <i class="material-icons toggle-icon">
              {{ expandedGroups.includes(index) ? "expand_less" : "expand_more" }}
            </i>
          </div>
          <transition name="slide-fade">
            <div v-if="expandedGroups.includes(index)" class="card-body">
              <!-- Jeder Eintrag innerhalb der Gruppe als eigene Inner-Card -->
              <div
                v-for="subject in group"
                :key="subject.ampelId"
                class="inner-card"
                :class="getRowClass(subject)"
              >
                <div class="inner-card-header">
                  {{ subject.subjectLangbezeichnung }}
                </div>
                <div class="inner-card-body">
                  <div class="card-detail-row">
                    <span class="card-label">Lehrer:</span>
                    <span class="card-value">{{ subject.teacherName }}</span>
                  </div>
                  <div class="card-detail-row">
                    <span class="card-label">Datum:</span>
                    <span class="card-value">
                      {{ formatDate(subject.updatedAt) || "Kein Datum" }}
                    </span>
                  </div>
                  <div class="card-detail-row">
                    <span class="card-label">Anmerkung:</span>
                    <span class="card-value">
                      {{ subject.bemerkung || "Keine Bemerkung" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Einzelne Fächer als einklappbare Cards mit eigener Inner-Card -->
        <div
          v-for="subject in singleSubjectList"
          :key="subject.ampelId"
          class="card single-card"
          :class="getRowClass(subject)"
        >
          <div class="card-header" @click="toggleSingle(subject.ampelId)">
            <span class="card-title">{{ subject.subjectLangbezeichnung }}</span>
            <i class="material-icons toggle-icon">
              {{ expandedSingles.has(subject.ampelId) ? "expand_less" : "expand_more" }}
            </i>
          </div>
          <transition name="slide-fade">
            <div v-if="expandedSingles.has(subject.ampelId)" class="card-body">
              <div class="inner-card">
                <div class="inner-card-header">Details</div>
                <div class="inner-card-body">
                  <div class="card-detail-row">
                    <span class="card-label">Lehrer:</span>
                    <span class="card-value">{{ subject.teacherName }}</span>
                  </div>
                  <div class="card-detail-row">
                    <span class="card-label">Datum:</span>
                    <span class="card-value">
                      {{ formatDate(subject.updatedAt) || "Kein Datum" }}
                    </span>
                  </div>
                  <div class="card-detail-row">
                    <span class="card-label">Anmerkung:</span>
                    <span class="card-value">
                      {{ subject.bemerkung || "Keine Bemerkung" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { format } from "date-fns";
import testdata from "@/assets/testdaten.json";
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";
import axios from "axios";
const snackbar = useSnackbarStore();

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
const expandedSingles = ref<Set<number>>(new Set());
const isMobile = ref(window.innerWidth < 768);

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 768;
};
window.addEventListener("resize", updateIsMobile);

const fetchSubjects = async () => {
  try {
    // Bei echten Daten: axios.get(...);
    // subjectList.value = testdata;
    const response = await axios.get("/student-ampel/getSchueler");
    subjectList.value = response.data;
  } catch (error) {
    snackbar.push(
      "Fehler beim Laden deiner Ampeln. Melde dich bitte beim Systemadministrator!"
    );
  }
};

const filteredSubjects = computed(() => {
  return subjectList.value.filter(
    (subject) => subject.farbe && subject.farbe.toUpperCase() !== "GRAU"
  );
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

const toggleSingle = (ampelId: number) => {
  const newSet = new Set(expandedSingles.value);
  if (newSet.has(ampelId)) {
    newSet.delete(ampelId);
  } else {
    newSet.add(ampelId);
  }
  expandedSingles.value = newSet;
};

const getRowClass = (subject: Subject) => {
  const farbe = subject.farbe.toUpperCase();
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
};

const getGroupRowClass = (group: Subject[]) => {
  const colors = group.map((item) => item.farbe.toUpperCase());
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
/* Allgemeine Container-Styles */
.modern-container {
  padding: 30px;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  transition: background 0.5s;
}

/* Desktop-Tabelle */
/* Tabelle nimmt jetzt die volle Screenhöhe ein */
.table-vertical-scroll {
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
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
  padding: 25px;
  text-align: left;
  font-weight: 600;
  font-size: 1.1em;
}
th,
td {
  padding: 15px 20px;

  border: none;

  border-radius: 0;

  margin: 0;

  list-style: none;
}
.data-row,
.group-row {
  transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}
.data-row:hover,
.group-row:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

/* Farbliche Markierungen (Desktop) */
.rowgreen {
  background-color: #388e3c !important;
  color: #fff;
}
.rowyellow {
  background-color: #fbc02d !important;
  color: #000;
}
.rowred {
  background-color: #d32f2f !important;
  color: #fff;
}
.rowblack {
  background-color: #212121 !important;
  color: #fff;
}

/* Child-Rows einrücken (Desktop):
   Der erste TD der Child-Rows erhält nun 50px mehr Padding */
.child-row td:first-child {
  padding-left: 100px;
}
.child-row.rowgreen td:first-child,
.child-row.rowyellow td:first-child,
.child-row.rowred td:first-child,
.child-row.rowblack td:first-child {
  padding-left: 162px;
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

/* Mobile Card-Ansicht */
.mobile-card-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
}
.card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.card-header {
  padding: 12px 15px;
  background: #fff;
  color: #000;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
.card-body {
  padding: 12px 15px;
  background: #fff;
  color: #000;
}
.card-detail-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}
.card-label {
  font-weight: bold;
}
.card-value {
  text-align: right;
}
.rowgreen.card {
  border-left: 8px solid #388e3c;
}
.rowyellow.card {
  border-left: 8px solid #fbc02d;
}
.rowred.card {
  border-left: 8px solid #d32f2f;
}
.rowblack.card {
  border-left: 8px solid #212121;
}
.inner-card.rowgreen {
  border-left: 8px solid #388e3c;
}
.inner-card.rowyellow {
  border-left: 8px solid #fbc02d;
}
.inner-card.rowred {
  border-left: 8px solid #d32f2f;
}
.inner-card.rowblack {
  border-left: 8px solid #212121;
}
.mobile-card-container .card.rowgreen,
.mobile-card-container .card.rowyellow,
.mobile-card-container .card.rowred,
.mobile-card-container .card.rowblack,
.mobile-card-container .inner-card.rowgreen,
.mobile-card-container .inner-card.rowyellow,
.mobile-card-container .inner-card.rowred,
.mobile-card-container .inner-card.rowblack {
  background-color: #fff !important;
  color: inherit !important;
}
.toggle-icon {
  font-size: 1.5em;
}
.inner-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 10px;
  padding: 8px;
}
.inner-card-header {
  font-weight: 600;
  margin-bottom: 5px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
  font-size: 1em;
}
.inner-card-body {
  font-size: 0.95em;
  margin-top: 5px;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
