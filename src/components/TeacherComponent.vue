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
            <!-- Nachname + Vorname -->
            <th class="col s3">
              <div class="icontext">
                <i class="material-icons">person</i> Schüler
                <button @click="sortBy('name')" class="legend-toggle">
                  <span v-if="sortOrders.name === 'asc'">▲</span>
                  <span v-else-if="sortOrders.name === 'desc'">▼</span>
                  <span v-else>⇅</span>
                </button>
              </div>
            </th>

            <!-- Klasse -->
            <th class="col">
              <div class="icontext">
                <i class="material-icons">class</i> Klasse
                <button @click="sortBy('klasse')" class="legend-toggle">
                  <span v-if="sortOrders.klasse === 'asc'">▲</span>
                  <span v-else-if="sortOrders.klasse === 'desc'">▼</span>
                  <span v-else>⇅</span>
                </button>
              </div>
            </th>

            <!-- Fach -->
            <th class="col">
              <div class="icontext">
                <i class="material-icons">school</i> Fach
                <button @click="sortBy('fach')" class="legend-toggle">
                  <span v-if="sortOrders.fach === 'asc'">▲</span>
                  <span v-else-if="sortOrders.fach === 'desc'">▼</span>
                  <span v-else>⇅</span>
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
                  >Grün</span>
                </label>
                <label>
                  <span
                    class="btn yellowbtn"
                    :class="{ selectedyellow: student.selectedColor === 'GELB' }"
                    @click="toggleColor(student, 'GELB')"
                  >Gelb</span>
                </label>
                <label>
                  <span
                    class="btn redbtn"
                    :class="{ selectedred: student.selectedColor === 'ROT' }"
                    @click="toggleColor(student, 'ROT')"
                  >Rot</span>
                </label>
                <label>
                  <span
                    class="btn black"
                    :class="{ selectedblack: student.selectedColor === 'SCHWARZ' }"
                    @click="toggleColor(student, 'SCHWARZ')"
                  >Schwarz</span>
                </label>
                <label>
                  <span
                    class="btn whitebtn black-text"
                    :class="{ selectednichtzustaendig: student.selectedColor === 'GRAU' }"
                    @click="toggleColor(student, 'GRAU')"
                  >Nicht Zuständig</span>
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

interface AmpelStudent {
  lessonId: number;
  studentId: number;
  teacherId: number;
  vname: string;    // Vorname
  nname: string;    // Nachname
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
      // Für jede Spalte: asc / desc / null (aus)
      sortOrders: {
        name: null as 'asc' | 'desc' | null,
        klasse: null as 'asc' | 'desc' | null,
        fach: null as 'asc' | 'desc' | null
      },
      // Reihenfolge der Spalten, die (derzeit) sortiert werden
      // Die erste Spalte in diesem Array hat die höchste Priorität.
      // (Falls du umgekehrte Reihenfolge willst, kannst du das im Sortiercode anpassen.)
      sortPriority: [] as string[],

      students: [] as AmpelStudent[],
    };
  },
  computed: {
    sortedAndFilteredStudents(): AmpelStudent[] {
      // 1) Kopie erstellen
      let filtered = [...this.students];

      // 2) Filter anwenden
      filtered = filtered.filter((student) => {
        // A) "Nicht Zuständig" = GRAU ausblenden, wenn !nichtZustaendig
        if (student.selectedColor === "GRAU" && !this.nichtZustaendig) {
          return false;
        }
        // B) Weiße Ampel = nur null oder GRAU
        if (this.weisseAmpel) {
          const isNullOrGrau =
            student.selectedColor === null || student.selectedColor === "GRAU";
          if (!isNullOrGrau) {
            return false;
          }
        }
        // C) Suchbegriffe
        if (this.searchTerm.trim().length > 0) {
          const terms = this.searchTerm.toLowerCase().split("/").filter((t) => t.trim());
          const fullName = (student.nname + " " + student.vname).toLowerCase();
          const fullNameRev = (student.vname + " " + student.nname).toLowerCase();

          const allMatch = terms.every(term => {
            return (
              student.nname.toLowerCase().includes(term) ||
              student.vname.toLowerCase().includes(term) ||
              fullName.includes(term) ||
              fullNameRev.includes(term) ||
              student.klasse.toLowerCase().includes(term) ||
              student.fach.toLowerCase().includes(term)
            );
          });
          if (!allMatch) {
            return false;
          }
        }
        return true;
      });

      // 3) Mehrfach-Sortierung
      filtered.sort((a, b) => {
        for (const col of this.sortPriority) {
          const order = this.sortOrders[col as keyof typeof this.sortOrders];
          if (!order) continue; // Falls zwischendurch null sein sollte
          let cmp = 0;

          if (col === "name") {
            const aname = a.nname.toLowerCase() + " " + a.vname.toLowerCase();
            const bname = b.nname.toLowerCase() + " " + b.vname.toLowerCase();
            cmp = aname.localeCompare(bname);
          } else if (col === "klasse") {
            cmp = a.klasse.toLowerCase().localeCompare(b.klasse.toLowerCase());
          } else if (col === "fach") {
            cmp = a.fach.toLowerCase().localeCompare(b.fach.toLowerCase());
          }

          if (cmp !== 0) {
            return order === "asc" ? cmp : -cmp;
          }
        }
        return 0;
      });

      return filtered;
    },
  },

  async created() {
    try {
      const response = await axios.get("/api/teacher-ampel/getLehrer");
      const data = response.data;
      // Backend -> Frontend Mapping
      this.students = data.map((ampel: any) => {
        return {
          lessonId: ampel.lessonId,
          studentId: ampel.studentId,
          teacherId: ampel.teacherId,
          nname: ampel.studentName.split(" ")[1] || "???",
          vname: ampel.studentName.split(" ")[0] || "",
          klasse: ampel.classroomName || "",
          fach: ampel.subjectLangbezeichnung || "",
          selectedColor: ampel.farbe || null,
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

    toggleColor(student: AmpelStudent, color: string) {
      // Gleiche Farbe erneut -> entfernen
      if (student.selectedColor === color) {
        student.selectedColor = null;
        this.saveAmpel(student);
      } else {
        student.selectedColor = color;
        this.saveAmpel(student);
      }
    },

    onNoteChange(student: AmpelStudent, index: number) {
      this.editingIndex = -1;
      if (!student.selectedColor) {
        console.log("Keine Ampelfarbe gesetzt, Bemerkung kann nicht gespeichert werden.");
        return;
      }
      if (!student.note || student.note.trim().length === 0) {
        student.note = "Keine Bemerkung";
      }
      this.saveAmpel(student);
    },

    async saveAmpel(student: AmpelStudent) {
      if (student.selectedColor === null) {
        // "Farbe entfernen" => DELETE
        await axios.delete("/api/ampel", {
          params: {
            lessonId: student.lessonId,
            studentId: student.studentId,
            teacherId: student.teacherId
          }
        });
      } else {
        // "Farbe + Bemerkung speichern" => POST
        try {
          const body = {
            lessonId: student.lessonId,
            studentId: student.studentId,
            teacherId: student.teacherId,
            farbe: student.selectedColor,
            bemerkung: student.note,
          };
          const response = await axios.post("/api/teacher-ampel", body);
          const updated = response.data;
          student.selectedColor = updated.farbe;
          student.note = updated.bemerkung;
        } catch (error: any) {
          console.error("Speicherfehler:", error.response ? error.response.data : error);
        }
      }
    },

    // Sortierschaltfläche angeklickt
    sortBy(column: "name" | "klasse" | "fach") {
      // Wir toggeln die Reihenfolge: null -> asc -> desc -> null ...
      const current = this.sortOrders[column];

      if (current === null) {
        // Von null auf 'asc' schalten
        this.sortOrders[column] = 'asc';
        // An das ENDE der Prioritätsliste anhängen (damit zuerst nach alten, dann neuem Kriterium sortiert wird)
        if (!this.sortPriority.includes(column)) {
          this.sortPriority.push(column);
        }
      } else if (current === 'asc') {
        // Von asc auf desc
        this.sortOrders[column] = 'desc';
      } else {
        // 'desc' -> wieder null (kein Sortieren)
        this.sortOrders[column] = null;
        // Aus Priority-Liste entfernen
        const idx = this.sortPriority.indexOf(column);
        if (idx >= 0) {
          this.sortPriority.splice(idx, 1);
        }
      }
    },
  },
});
</script>

<style scoped>
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

/* Ampel-Buttons */
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

/* Active states */
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

/* Zeilenfarben (Highlight) */
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

/* Beispiel: Floating Action Button, falls gebraucht */
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
