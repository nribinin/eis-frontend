<template>
  <div class="schuelerTable">
    <template v-if="subjectList.length === 0">
      <p class="no-data-message">Kein Lehrer hat dich noch bewertet</p>
    </template>
    <template v-else>
      <table class="striped">
        <thead class="fixed theader">
          <tr>
            <th class="col">
              <div class="icontext"><i class="material-icons">school</i>Gegenstand</div>
            </th>
            <th class="col">
              <div class="icontext"><i class="material-icons">person</i>Lehrer</div>
            </th>
            <th class="col">
              <div class="icontext"><i class="material-icons">insert_invitation</i>Datum</div>
            </th>
            <th class="col">
              <div class="icontext"><i class="material-icons">subject</i>Anmerkung</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(group, index) in groupedSubjectList" :key="index">
            <tr v-if="group.length > 1" :class="getGroupRowClass(group)">
              <td>
                {{ group[0].subjectLangbezeichnung }}
                <img
                  v-if="getGroupRowClass(group) === 'rowblack' && !expandedGroups.includes(index)"
                  src="../assets/arrowDown_White.png"
                  alt="dropdown icon"
                  class="dropdown-icon"
                  @click="toggleGroup(index)"
                  style="cursor: pointer"
                />
                <img
                  v-if="getGroupRowClass(group) === 'rowblack' && expandedGroups.includes(index)"
                  src="../assets/arrowUp_White.png"
                  alt="dropdown icon"
                  class="dropdown-icon"
                  @click="toggleGroup(index)"
                  style="cursor: pointer"
                />
                <img
                  v-else-if="!expandedGroups.includes(index)"
                  src="../assets/arrowDown.png"
                  alt="dropdown icon"
                  class="dropdown-icon"
                  @click="toggleGroup(index)"
                  style="cursor: pointer"
                />
                <img
                  v-else-if="expandedGroups.includes(index)"
                  src="../assets/arrowUp.png"
                  alt="dropdown icon"
                  class="dropdown-icon"
                  @click="toggleGroup(index)"
                  style="cursor: pointer"
                />
              </td>
              <td colspan="3"></td>
            </tr>
            <template v-if="expandedGroups.includes(index)">
              <tr
                v-for="subject in group"
                :key="subject.ampelId"
                :class="getRowClass(subject)"
              >
                <td style="padding-left: 50px">
                  {{ subject.subjectLangbezeichnung }}
                </td>
                <td style="padding-left: 50px">{{ subject.teacherName }}</td>
                <td style="padding-left: 50px">
                  {{ formatDate(subject.updatedAt) || "Kein Datum" }}
                </td>
                <td style="padding-left: 50px">
                  {{ subject.bemerkung || "Keine Bemerkung" }}
                </td>
              </tr>
            </template>
          </template>

          <tr
            v-for="subject in singleSubjectList"
            :key="subject.ampelId"
            :class="getRowClass(subject)"
          >
            <td>{{ subject.subjectLangbezeichnung }}</td>
            <td>{{ subject.teacherName }}</td>
            <td>{{ formatDate(subject.updatedAt) || "Kein Datum" }}</td>
            <td>{{ subject.bemerkung || "Keine Bemerkung" }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { format } from 'date-fns';

interface Subject {
  ampelId: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  subjectKurzbezeichnung: string;
  subjectLangbezeichnung: string;
  gegenstandsart: string;
  classroomName: string;
  farbe: string;
  bemerkung: string | null;
  updatedAt: string | null;
  lessonId: number;
}

const subjectList = ref<Subject[]>([]);
const expandedGroups = ref<number[]>([]);

const fetchSubjects = async () => {
  try {
    const response = await axios.get('/api/student-ampel/getSchueler');
    subjectList.value = response.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
  }
};

const filteredSubjects = computed(() => {
  return subjectList.value.filter(subject => subject.farbe !== 'GRAU');
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
    case 'GRUEN':
      return 'rowgreen';
    case 'GELB':
      return 'rowyellow';
    case 'ROT':
      return 'rowred';
    case 'SCHWARZ':
      return 'rowblack';
    default:
      return '';
  }
};

const getGroupRowClass = (group: Subject[]) => {
  const colors = group.map((item) => item.farbe);
  if (colors.includes('SCHWARZ')) return 'rowblack';
  if (colors.includes('ROT')) return 'rowred';
  if (colors.includes('GELB')) return 'rowyellow';
  if (colors.includes('GRUEN')) return 'rowgreen';
  return '';
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  return format(new Date(dateString), 'dd.MM.yyyy HH:mm');
};

onMounted(fetchSubjects);
</script>

<style scoped>
.rowgreen {
  background-color: #009640 !important;
}
.icontext {
  display: flex !important;
  align-items: center !important;
  flex-direction: initial;
}
.rowyellow {
  background-color: #ffc107 !important;
}
.rowred {
  background-color: #e30613 !important;
  color: white;
}
.rowblack {
  background-color: #000000 !important;
  color: white;
}
.dropdown-icon {
  margin-left: 10px;
  height: 15px;
}
.fixed {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 999;
}
.theader {
  background-color: white;
}
.schuelerTable {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.no-data-message {
  text-align: center;
  font-size: 1.5em;
  margin-top: 2em;
  color: #555;
}
</style>
