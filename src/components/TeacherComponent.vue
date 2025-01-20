<template>
  <div class="maincontainer">
    <!-- Filterfeld -->
    <div class="fixed">
      <div class="filter p-2">
        <div class="row">
          <div class="col">
            <h6>Filter</h6>
          </div>
          <div class="col s5">
            <input
              id="searchTerm"
              v-model="searchTerm"
              placeholder="Auswahl von Filtern getrennt mit '/'"
            />
          </div>
          <div class="col">
            <label>
              <input type="checkbox" v-model="weisseAmpel" />
              <span>Weiße Ampel</span>
            </label>
            <p>Nur Schüler, die noch nicht eingetragen wurden (oder Grau)</p>
          </div>
          <div class="col">
            <label>
              <input type="checkbox" v-model="nichtZustaendig" />
              <span>Nicht Zuständig anzeigen</span>
            </label>
            <p>Zeige zusätzlich Schüler mit Farbe „GRAU“</p>
          </div>
        </div>
      </div>
    </div>

    <div class="tablecontainer">
      <!-- Schülerliste -->
      <table class="striped">
        <thead class="fixed">
          <tr>
            <!-- Nachname Vorname + Sortier-Pfeil -->
            <th class="col s3">
              <div class="icontext">
                <i class="material-icons">person</i> Schüler
                <button @click="sortBy('name')" class="legend-toggle">
                  <!-- Pfeil nur zeigen, wenn sortColumn === 'name' -->
                  <span v-if="sortColumn === 'name'">
                    <span v-if="sortDirection === 'desc'">▼</span>
                    <span v-else>▲</span>
                  </span>
                </button>
              </div>
            </th>

            <!-- Klasse + Sortier-Pfeil -->
            <th class="col">
              <div class="icontext">
                <i class="material-icons">class</i> Klasse
                <button @click="sortBy('klasse')" class="legend-toggle">
                  <span v-if="sortColumn === 'klasse'">
                    <span v-if="sortDirection === 'desc'">▼</span>
                    <span v-else>▲</span>
                  </span>
                </button>
              </div>
            </th>

            <!-- Fach + Sortier-Pfeil -->
            <th class="col">
              <div class="icontext">
                <i class="material-icons">school</i> Fach
                <button @click="sortBy('fach')" class="legend-toggle">
                  <span v-if="sortColumn === 'fach'">
                    <span v-if="sortDirection === 'desc'">▼</span>
                    <span v-else>▲</span>
                  </span>
                </button>
              </div>
            </th>

            <th class="col">
              <div class="icontext">
                <i class="material-icons">traffic</i> Ampelfarbe
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
          <tr
            class="z-depth-1"
            v-for="(student, index) in sortedAndFilteredStudents"
            :key="index"
            :class="rowClass(student.selectedColor)"
          >
            <!-- Anzeige: Nachname Vorname -->
            <td>{{ student.nname }} {{ student.vname }}</td>
            <td>{{ student.klasse }}</td>
            <td>{{ student.fach }}</td>
            <td>
              <!-- Ampelbuttons als Toggle -->
              <div class="radio-buttons">
                <label>
                  <span
                    class="btn greenbtn"
                    :class="{ selectedgreen: student.selectedColor === 'GRUEN' }"
                    @click="toggleColor(student, 'GRUEN')"
                    >Grün</span
                  >
                </label>
                <label>
                  <span
                    class="btn yellowbtn"
                    :class="{ selectedyellow: student.selectedColor === 'GELB' }"
                    @click="toggleColor(student, 'GELB')"
                    >Gelb</span
                  >
                </label>
                <label>
                  <span
                    class="btn redbtn"
                    :class="{ selectedred: student.selectedColor === 'ROT' }"
                    @click="toggleColor(student, 'ROT')"
                    >Rot</span
                  >
                </label>
                <label>
                  <span
                    class="btn black"
                    :class="{ selectedblack: student.selectedColor === 'SCHWARZ' }"
                    @click="toggleColor(student, 'SCHWARZ')"
                    >Schwarz</span
                  >
                </label>
                <label>
                  <span
                    class="btn whitebtn black-text"
                    :class="{ selectednichtzustaendig: student.selectedColor === 'GRAU' }"
                    @click="toggleColor(student, 'GRAU')"
                    >Nicht Zuständig</span
                  >
                </label>
              </div>
            </td>

            <td class="notecol">
              <!-- Bemerkung Inline Edit -->
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

    <!-- Floating Save Button (optional, falls du das Gesamtspeichern willst) -->
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
  vname: string;          // Vorname
  nname: string;          // Nachname
  klasse: string;
  fach: string;
  selectedColor: string | null; // "ROT", "GELB", "GRUEN", "SCHWARZ", "GRAU" oder null
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
      nichtZustaendig: false,
      searchTerm: "",
      sortColumn: "klasse" as "name" | "klasse" | "fach",
      sortDirection: "asc" as "asc" | "desc",
      students: [] as AmpelStudent[],
    };
  },
  computed: {
    sortedAndFilteredStudents(): AmpelStudent[] {
      // 1) Filter "nicht zuständig" (Farbe = GRAU)
      //    => Nur zeigen, wenn "nichtZustaendig" true ist
      let filtered = this.students.filter((st) => {
        if (st.selectedColor === "GRAU" && !this.nichtZustaendig) {
          return false; // ausblenden
        }
        return true;
      });

      // 2) Filter "weisseAmpel": Nur Schüler, die noch keine Farbe haben oder "GRAU"
      if (this.weisseAmpel) {
        filtered = filtered.filter(
          (st) => st.selectedColor === null || st.selectedColor === "GRAU"
        );
      }

      // 3) Suchbegriff (Aufteilung mit "/")
      if (this.searchTerm.trim().length > 0) {
        const terms = this.searchTerm.toLowerCase().split("/").filter((t) => t.trim());
        filtered = filtered.filter((st) =>
          terms.every((term) => {
            // Suche in Nachname, Vorname, Klasse, Fach, oder beidem
            const fullName = (st.nname + " " + st.vname).toLowerCase();
            const fullNameReverse = (st.vname + " " + st.nname).toLowerCase();
            return (
              st.nname.toLowerCase().includes(term) ||
              st.vname.toLowerCase().includes(term) ||
              fullName.includes(term) ||
              fullNameReverse.includes(term) ||
              st.klasse.toLowerCase().includes(term) ||
              st.fach.toLowerCase().includes(term)
            );
          })
        );
      }

      // 4) Sortierung
      //    - "name" => sortiere nach Nachname, dann Vorname
      //    - "klasse" => sortiere nach Klasse
      //    - "fach" => sortiere nach Fach
      filtered.sort((a, b) => {
        let cmp = 0;

        if (this.sortColumn === "name") {
          const aname = a.nname.toLowerCase() + " " + a.vname.toLowerCase();
          const bname = b.nname.toLowerCase() + " " + b.vname.toLowerCase();
          cmp = aname.localeCompare(bname);
        } else if (this.sortColumn === "klasse") {
          cmp = a.klasse.localeCompare(b.klasse);
        } else if (this.sortColumn === "fach") {
          cmp = a.fach.localeCompare(b.fach);
        }

        return this.sortDirection === "asc" ? cmp : -cmp;
      });

      return filtered;
    },
  },
  async created() {
    try {
      const response = await axios.get("/api/teacher-ampel/getLehrer");
      const data = response.data;
      // Mappen auf AmpelStudent
      this.students = data.map((ampel: any) => {
        // Achte darauf, dass du die Felder so befüllst, wie das Backend sie liefert
        return {
          lessonId: ampel.lessonId,
          studentId: ampel.studentId,
          teacherId: ampel.teacherId,
          // hier nur ein Beispiel, falls studentName "Mustermann Max" sein sollte:
          nname: ampel.studentName.split(" ")[0] || "???",
          vname: ampel.studentName.split(" ")[1] || "",
          klasse: ampel.classroomName || "",
          fach: ampel.subjectLangbezeichnung || "",
          selectedColor: ampel.farbe || null,  // "ROT", "GELB", ...
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
        // GRAU oder null => kein extra row style
        default:
          return "";
      }
    },

    toggleColor(student: AmpelStudent, color: string) {
      // Gleiches Anklicken => Farbe entfernen
      if (student.selectedColor === color) {
        student.selectedColor = null;
        // Falls du beim Entfernen auch einen Request möchtest, kannst du hier
        // z.B. den Wert auf "" oder null setzen und saveAmpel rufen:
        // this.saveAmpel(student);
        // return;
      } else {
        student.selectedColor = color;
        // Sofort speichern
        this.saveAmpel(student);
      }
    },

    onNoteChange(student: AmpelStudent, index: number) {
      this.editingIndex = -1;
      if (!student.selectedColor) {
        // Falls keine Farbe => nur Fehlermeldung in der Konsole
        console.log(
          "Keine Ampelfarbe gesetzt, Bemerkung kann nicht gespeichert werden."
        );
        return;
      }
      // Wenn Bemerkung leer => "Keine Bemerkung"
      if (!student.note || student.note.trim().length === 0) {
        student.note = "Keine Bemerkung";
      }
      // Speichern
      this.saveAmpel(student);
    },

    async saveAmpel(student: AmpelStudent) {
      try {
        const body = {
          lessonId: student.lessonId,
          studentId: student.studentId,
          teacherId: student.teacherId,
          farbe: student.selectedColor, // "ROT", "GELB", ...
          bemerkung: student.note,
        };
        const response = await axios.post("/api/teacher-ampel", body);
        // Optional: aktualisiere Felder aus der Response
        const updated = response.data;
        student.selectedColor = updated.farbe;
        student.note = updated.bemerkung;
      } catch (error: any) {
        console.error(
          "Speicherfehler:",
          error.response ? error.response.data : error
        );
      }
    },

    // Sortier-Button geklickt
    sortBy(column: "name" | "klasse" | "fach") {
      if (this.sortColumn === column) {
        // Richtung toggeln
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortColumn = column;
        this.sortDirection = "asc";
      }
    },

    // Optional: Gesamtspeicher-Funktion
    saveAllChanges() {
      this.students.forEach((student) => {
        if (student.selectedColor) {
          this.saveAmpel(student);
        }
      });
      console.log("Alle Änderungen gespeichert (sofern Farbe vorhanden war).");
    },
  },
});
</script>

<style scoped>
/* Wie in deinem Beispiel */
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

th {
  border-radius: 0% !important;
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

.legend-toggle {
  background: none;
  border: none;
  cursor: pointer;
}

label {
  display: flex;
  align-items: center;
  font-size: 18px;
}

p {
  margin: 0;
  padding-left: 40px;
  font-size: 14px;
  color: gray;
}

.filter {
  padding: 1rem;
  padding-bottom: 0%;
  margin-bottom: 0%;
  border: 1px solid #ddd;
  background-color: white;
}

/* Button-Farben */
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

/* Aktive States */
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

/* Zeilenfärbung */
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
  width: 90%;
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
