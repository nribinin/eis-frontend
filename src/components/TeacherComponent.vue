<template>
  <div class="maincontainer">
    <!-- Filterfeld (optional wie im Design) -->
    <div class="fixed">
      <div class="filter p-2">
        <!-- Nur ein kurzes Beispiel -->
        <h6>Filter</h6>
        <input
          id="searchTerm"
          v-model="searchTerm"
          placeholder="Auswahl von Filtern getrennt mit '/'"
        />
        <label>
          <input type="checkbox" v-model="weisseAmpel" />
          <span>Weiße Ampel</span>
        </label>
        <p>Nur Schüler, die noch nicht eingetragen wurden</p>
      </div>
    </div>

    <div class="tablecontainer">
      <!-- Schülerliste -->
      <table class="striped">
        <thead class="fixed">
          <tr>
            <th>Schüler</th>
            <th>Klasse</th>
            <th>Fach</th>
            <th>Ampelfarbe</th>
            <th>Anmerkung</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(student, index) in sortedAndFilteredStudents"
            :key="index"
            :class="rowClass(student.selectedColor)"
          >
            <td>{{ student.vname }} {{ student.nname }}</td>
            <td>{{ student.klasse }}</td>
            <td>{{ student.fach }}</td>
            <td>
              <!-- Ampelbuttons -->
              <div class="radio-buttons">
                <label>
                  <span
                    class="btn greenbtn"
                    :class="{ selectedgreen: student.selectedColor === 'GRUEN' }"
                    @click="toggleColor(student, 'GRUEN')"
                  >
                    Grün
                  </span>
                </label>
                <label>
                  <span
                    class="btn yellowbtn"
                    :class="{ selectedyellow: student.selectedColor === 'GELB' }"
                    @click="toggleColor(student, 'GELB')"
                  >
                    Gelb
                  </span>
                </label>
                <label>
                  <span
                    class="btn redbtn"
                    :class="{ selectedred: student.selectedColor === 'ROT' }"
                    @click="toggleColor(student, 'ROT')"
                  >
                    Rot
                  </span>
                </label>
                <label>
                  <span
                    class="btn black"
                    :class="{ selectedblack: student.selectedColor === 'SCHWARZ' }"
                    @click="toggleColor(student, 'SCHWARZ')"
                  >
                    Schwarz
                  </span>
                </label>
                <label>
                  <span
                    class="btn whitebtn black-text"
                    :class="{ selectednichtzustaendig: student.selectedColor === 'GRAU' }"
                    @click="toggleColor(student, 'GRAU')"
                  >
                    Nicht Zuständig
                  </span>
                </label>
              </div>
            </td>
            <td class="notecol">
              <span v-if="editingIndex === index">
                <input
                  class="noteinput"
                  v-model="student.note"
                  @blur="onNoteChange(student, index)"
                  @keyup.enter="onNoteChange(student, index)"
                  placeholder="Anmerkung eingeben"
                />
              </span>
              <span v-else @click="editingIndex = index">
                <template v-if="student.note">
                  {{ student.note }}
                </template>
                <template v-else>
                  <i class="material-icons">add</i>
                </template>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Floating Save Button (optional) -->
    <div class="fab-container">
      <button
        class="btn-floating btn-large waves-effect waves-light red"
        @click="saveAllChanges"
        @mouseover="showLabel = true"
        @mouseleave="showLabel = false"
      >
        <i class="material-icons">save</i>
      </button>
      <div
        class="fab-label"
        v-show="showLabel"
        @mouseover="showLabel = true"
        @mouseleave="showLabel = false"
      >
        Speichern
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

interface AmpelStudent {
  lessonId: number;
  studentId: number;
  teacherId: number;
  vname: string;
  nname: string;
  klasse: string;
  fach: string;
  selectedColor: string | null; // z.B. 'ROT', 'GELB', 'GRUEN', 'SCHWARZ', 'GRAU'
  note: string;
}

export default defineComponent({
  name: "TeacherAmpelMerged",
  props: {
    teacherId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      editingIndex: -1 as number,
      showLabel: false,
      weisseAmpel: false,
      searchTerm: "",
      students: [] as AmpelStudent[],
    };
  },
  computed: {
    sortedAndFilteredStudents(): AmpelStudent[] {
      // Optional Sortierung + Filter, du kannst deine Filterlogik übernehmen
      let filtered = [...this.students];

      // Beispiel: wir filtern nach "weisseAmpel"
      if (this.weisseAmpel) {
        filtered = filtered.filter(
          (student) => !student.selectedColor || student.selectedColor === "GRAU"
        );
      }

      if (this.searchTerm) {
        const terms = this.searchTerm.toLowerCase().split("/").filter((t) => t.trim().length > 0);
        filtered = filtered.filter((student) =>
          terms.every((term) =>
            (student.vname + " " + student.nname).toLowerCase().includes(term) ||
            student.klasse.toLowerCase().includes(term) ||
            student.fach.toLowerCase().includes(term)
          )
        );
      }

      // Beispielhafte Sortierung nach Klasse, dann Fach, dann Nachname
      filtered.sort((a, b) => {
        if (a.klasse < b.klasse) return -1;
        if (a.klasse > b.klasse) return 1;
        if (a.fach < b.fach) return -1;
        if (a.fach > b.fach) return 1;
        if (a.nname < b.nname) return -1;
        if (a.nname > b.nname) return 1;
        return 0;
      });

      return filtered;
    },
  },
  async created() {
    // Lade deine Daten vom Backend (z.B. GET /api/teacher-ampel/getLehrer)
    // und mappe sie in das students-Array
    try {
      const response = await axios.get("/api/teacher-ampel/getLehrer");
      // response.data ist hier dein Array von AmpelDto
      const data = response.data;
      this.students = data.map((ampel: any) => {
        return {
          lessonId: ampel.lessonId,
          studentId: ampel.studentId,
          teacherId: ampel.teacherId,
          vname: ampel.studentName.split(" ")[0] || "", // Bsp. Parsen, falls "Max Mustermann"
          nname: ampel.studentName.split(" ")[1] || "",
          klasse: ampel.classroomName,
          fach: ampel.subjectLangbezeichnung,
          selectedColor: ampel.farbe || null, // "ROT", "GELB", ...
          note: ampel.bemerkung || "",
        } as AmpelStudent;
      });
    } catch (error: any) {
      console.error("Fehler beim Laden der Ampeldaten:", error?.response?.data || error.message);
    }
  },
  methods: {
    rowClass(color: string | null): string {
      switch (color) {
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
    },

    // Farbe toggeln
    async toggleColor(student: AmpelStudent, color: string) {
      // Wenn dieselbe Farbe nochmal angeklickt wird -> abwählen
      if (student.selectedColor === color) {
        student.selectedColor = null;
        // Falls du beim Entfernen der Farbe auch einen Request schicken willst,
        // kannst du hier entweder den Wert "" senden oder es ganz lassen.
        // return; // <--- Option, falls wir bei Entfernen nichts speichern wollen.
      } else {
        student.selectedColor = color;
      }

      // Sobald eine Farbe gesetzt ist (nicht null), machen wir den Live-Save
      if (student.selectedColor) {
        await this.saveAmpel(student);
      } else {
        // Falls du beim Entfernen der Farbe einen Request machen möchtest,
        // rufe hier die gleiche Methode auf, aber mit leerem Eintrag.
        // Oder du entscheidest, dass wir hier nichts machen.
        console.log("Farbe entfernt, kein Post ausgeführt.");
      }
    },

    // Bemerkung geändert
    async onNoteChange(student: AmpelStudent, index: number) {
      this.editingIndex = -1; // oder index = null: wir verlassen den Bearbeitungsmodus

      // Wenn keine Ampel-Farbe gesetzt ist -> console.log Fehlermeldung
      if (!student.selectedColor) {
        console.log("Keine Ampelfarbe gesetzt, kann Bemerkung nicht speichern.");
        return;
      }

      // Prüfe, ob Bemerkung leer ist. Wenn ja, "Keine Bemerkung"
      if (!student.note || student.note.trim().length === 0) {
        student.note = "Keine Bemerkung";
      }

      // Nun die Bemerkung speichern
      await this.saveAmpel(student);
    },

    // Die eigentliche POST-Funktion
    async saveAmpel(student: AmpelStudent) {
      try {
        // Request-Body (AmpelRequestDto)
        const body = {
          lessonId: student.lessonId,
          studentId: student.studentId,
          teacherId: student.teacherId,
          farbe: student.selectedColor, // "ROT", "GRUEN", ...
          bemerkung: student.note,
        };

        // Da im Backend ein POST (create) oder PUT (update) unterschiedlich sein können,
        // kann man hier das handling machen:
        // => Du könntest z.B. immer POST machen, wenn der Eintrag noch nicht existiert
        //    und PUT, wenn er existiert. In deinem Code hattest du "createOrUpdateAmpel" 
        //    aber auch per POST. Also hier z.B. immer POST:
        const response = await axios.post("/api/teacher-ampel", body);

        // Optional: Aktualisiere deine lokalen Daten mit der Antwort vom Backend
        // (z.B. falls das Backend geänderte Felder zurückgibt)
        // In dem AmpelDto kommt evtl. updatedAt, ampelId etc. zurück
        const updated = response.data;
        student.selectedColor = updated.farbe;
        student.note = updated.bemerkung;
      } catch (error: any) {
        console.error("Speicherfehler:", error.response ? error.response.data : error);
      }
    },

    // Beispiel-Funktion, um beim Klick auf den Floating Save Button alle Einträge zu speichern
    // (falls du so eine Gesamtspeicherung möchtest)
    saveAllChanges() {
      // Hier kannst du z.B. alle `students` durchgehen und noch mal saveAmpel aufrufen
      // oder du machst es anders.
      this.students.forEach((student) => {
        // Nur speichern, wenn eine Farbe gesetzt ist
        if (student.selectedColor) {
          this.saveAmpel(student);
        }
      });
      console.log("Alle Änderungen gespeichert (falls Farbe vorhanden war).");
    },
  },
});
</script>

<style scoped>
/* Beispiellayout wie in deinem ursprünglichen Code */
.maincontainer {
  overflow-y: auto;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}
.fixed {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
}
.tablecontainer {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
thead {
  background-color: white;
}
.icontext {
  display: flex !important;
  align-items: center !important;
  flex-direction: initial;
}
.material-icons {
  margin-right: 0.3em;
}
.radio-buttons label {
  display: inline-block;
  margin-right: 0.5em;
}
.greenbtn {
  background: #009640 !important;
}
.yellowbtn {
  background-color: #ffc107 !important;
}
.redbtn {
  background-color: #e30613 !important;
}
.whitebtn {
  background-color: white !important;
  color: #000000 !important;
  min-width: 165.975px !important;
}
/* Hervorheben der aktiv ausgewählten Farbe */
.selectedgreen {
  box-shadow: 0 0 15px 10px #46c02e !important;
  background-color: #005c27 !important;
  z-index: 100;
  max-width: 72.075px;
  font-weight: bold;
}
.selectedyellow {
  box-shadow: 0 0 15px 10px #ffd700 !important;
  background-color: #ffa500 !important;
  z-index: 100;
  max-width: 65.313px;
  font-weight: bold;
}
.selectedred {
  box-shadow: 0 0 15px 10px #ff4500 !important;
  background-color: #890008 !important;
  z-index: 100;
  max-width: 59px;
  font-weight: bold;
}
.selectedblack {
  box-shadow: 0 0 15px 10px #696969 !important;
  background-color: #000000 !important;
  z-index: 100;
  max-width: 99.475px;
  font-weight: bold;
}
.selectednichtzustaendig {
  box-shadow: 0 0 15px 10px #000000b1 !important;
  background-color: #dacbcb !important;
  z-index: 100;
  min-width: 165.975px !important;
  font-weight: bold;
  padding: auto !important;
}
/* Hintergründe für die Zeilen: rowgreen, rowyellow, rowred, rowblack, ... */
.rowgreen {
  background-color: #009641e2 !important;
}
.rowyellow {
  background-color: #ffc107e2 !important;
}
.rowred {
  background-color: #e30613e2 !important;
  color: white;
}
.rowblack {
  background-color: #000000 !important;
  color: white;
}
.notecol {
  width: 13.727em !important;
  max-width: 13.727em !important;
  overflow-x: hidden;
}
.noteinput {
  height: 100% !important;
}
.fab-container {
  position: fixed;
  bottom: 1.1em;
  right: 1.1em;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.fab-container button {
  position: relative;
  background-color: darkcyan !important;
}
.fab-label {
  position: absolute;
  bottom: 4em;
  background-color: #fff;
  color: #000;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: opacity 0.3s, transform 0.3s;
  opacity: 0;
  transform: translateY(10px);
}
.fab-container:hover .fab-label {
  opacity: 1;
  transform: translateY(0);
}
.fab-container .fab-label:after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
}
</style>
