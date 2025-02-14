<template>
  <div class="container">
    <!-- Warnhinweis -->
    <div class="row">
      <div class="col s12">
        <div class="card warn-card">
          <div class="card-content center">
            <span class="card-title">Wichtiger Hinweis</span>
            <p>
              BEACHTE! Ist die Datenbank bereits mit Daten befüllt und du versuchst, 
              Daten hochzuladen, könntest du Probleme verursachen!
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Kategorie: Datenbank hochladen -->
    <div class="row">
      <div class="col s12">
        <div class="card upload-card">
          <div class="card-content">
            <span class="card-title">Datenbank hochladen</span>
            <div class="file-field input-field">
              <div class="btn primary blue">
                <span>Sokrates Datei auswählen</span>
                <input
                  type="file"
                  id="file"
                  accept=".csv"
                  @change="onFileSelected"
                />
              </div>
              <div class="file-path-wrapper">
                <input
                  class="file-path validate"
                  type="text"
                  :value="selectedFile ? selectedFile.name : ''"
                  placeholder="Keine Datei ausgewählt"
                  readonly
                />
              </div>
            </div>
          </div>
          <div class="card-action center">
            <button
              class="btn green"
              :disabled="!selectedFile"
              @click="openModal('upload')"
            >
              Datenbank befüllen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Kategorie: Datenbank komplett leeren -->
    <div class="row">
      <div class="col s12">
        <div class="card delete-card">
          <div class="card-content">
            <span class="card-title">Datenbank komplett leeren</span>
            <p>Hiermit entfernst du sämtliche Einträge aus der Datenbank.</p>
          </div>
          <div class="card-action center">
            <button class="btn red" @click="openModal('delete')">
              Datenbank leeren
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Kategorie: Ampeleinträge zurücksetzen -->
    <div class="row">
      <div class="col s12">
        <div class="card reset-card">
          <div class="card-content">
            <span class="card-title">Ampeleinträge zurücksetzen</span>
            <p>
              Setze die Ampeleinträge zurück – dies betrifft nur diesen Teil der Datenbank.
            </p>
          </div>
          <div class="card-action center">
            <button class="btn red" @click="openModal('deleteAmpel')">
              Ampeleinträge zurücksetzen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal für Bestätigungen -->
    <div id="confirmation-modal" class="modal custom-modal">
      <div class="modal-content center">
        <h4>Bestätigung</h4>
        <p v-if="!loading">{{ modalMessage }}</p>
        <p v-else class="loading-message">
          <i class="material-icons spin">autorenew</i>
          <span>{{ loadingMessage }}</span>
        </p>
      </div>
      <div class="modal-footer">
        <button
          class="modal-close btn grey"
          @click="cancelAction"
          :disabled="loading"
        >
          Zurück
        </button>
        <button class="btn red" @click="proceedAction" :disabled="loading">
          Ja
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import axios from "axios";
import M from "materialize-css";
import { useSnackbarStore } from "@/stores/SnackbarStore.ts";
const snackbar = useSnackbarStore();

export default defineComponent({
  name: "CsvUploader",
  setup() {
    const selectedFile = ref<File | null>(null);
    const modalInstance = ref<M.Modal | null>(null);
    const modalMessage = ref("");
    const loadingMessage = ref("");
    const loading = ref(false);
    const currentActionType = ref("");

    onMounted(() => {
      const modalElement = document.getElementById("confirmation-modal");
      if (modalElement) {
        modalInstance.value = M.Modal.init(modalElement, {
          dismissible: false,
        });
      }
    });

    const onFileSelected = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (file.type === "text/csv" || file.name.endsWith(".csv")) {
          selectedFile.value = file;
        } else {
          snackbar.push("Nur CSV-Dateien sind erlaubt");
          selectedFile.value = null;
        }
      }
    };

    const openModal = (type: string) => {
      if (type === "upload" && !selectedFile.value) {
        M.toast({ html: "Keine Datei ausgewählt.", classes: "red" });
        return;
      }
      currentActionType.value = type;
      if (type === "upload") {
        modalMessage.value =
          "Bist du sicher, dass du die Datei hochladen möchtest?";
      } else if (type === "delete") {
        modalMessage.value =
          "Bist du sicher, dass du die gesamte Datenbank leeren möchtest?";
      } else if (type === "deleteAmpel") {
        modalMessage.value =
          "Bist du sicher, dass du die Ampeleinträge zurücksetzen möchtest?";
      }
      loading.value = false;
      modalInstance.value?.open();
    };

    const proceedAction = async () => {
      loading.value = true;
      loadingMessage.value =
        currentActionType.value === "upload"
          ? "Daten werden aktuell hochgeladen..."
          : "Daten werden aktuell gelöscht...";

      if (currentActionType.value === "upload") {
        await uploadCsvFile();
      } else if (currentActionType.value === "deleteAmpel") {
        await deleteAllAmpel();
      } else {
        await deleteCsv();
      }
    };

    const uploadCsvFile = async () => {
      const formData = new FormData();
      formData.append("file", selectedFile.value!);
      try {
        await axios.post("/admin/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        snackbar.push("Daten erfolgreich hochgeladen");
        selectedFile.value = null;
      } catch (error) {
        snackbar.push("Es ist ein Fehler aufgetreten: " + error);
      } finally {
        loading.value = false;
        modalInstance.value?.close();
      }
    };

    const deleteCsv = async () => {
      try {
        await axios.delete("/admin/deleteAll");
        snackbar.push("Daten erfolgreich gelöscht");
      } catch (error) {
        snackbar.push("Es ist ein Fehler aufgetreten: " + error);
      } finally {
        loading.value = false;
        modalInstance.value?.close();
      }
    };

    const deleteAllAmpel = async () => {
      try {
        await axios.delete("/admin/deleteAllAmpel");
        snackbar.push("Ampeleinträge erfolgreich zurückgesetzt");
      } catch (error) {
        snackbar.push("Es ist ein Fehler aufgetreten: " + error);
      } finally {
        loading.value = false;
        modalInstance.value?.close();
      }
    };

    const cancelAction = () => {
      if (!loading.value) {
        modalInstance.value?.close();
      }
    };

    return {
      selectedFile,
      modalMessage,
      loading,
      loadingMessage,
      openModal,
      proceedAction,
      cancelAction,
      onFileSelected,
    };
  },
});
</script>

<style scoped>
/* Allgemeine Container-Stile */
.container {
  margin-top: 50px;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #333;
}

/* Gemeinsame Card-Eigenschaften */
.card {
  margin-bottom: 20px;
  border-radius: 4px;
}

/* Upload-Kachel */
.upload-card {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-left: 6px solid #000;
  transition: transform 0.2s ease-in-out;
}
.upload-card:hover {
  transform: translateY(-2px);
}
.upload-card .card-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #000;
}

/* Löschen-Kachel */
.delete-card {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-left: 6px solid #000;
  transition: transform 0.2s ease-in-out;
}
.delete-card:hover {
  transform: translateY(-2px);
}
.delete-card .card-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #000;
}

/* Zurücksetzen-Kachel */
.reset-card {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-left: 6px solid #000;
  transition: transform 0.2s ease-in-out;
}
.reset-card:hover {
  transform: translateY(-2px);
}
.reset-card .card-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #000;
}

/* Warnhinweis-Card */
.warn-card {
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #e53935;
  border-radius: 4px;
}

/* Modal-Styles */
.custom-modal .modal {
  border-radius: 8px;
  overflow: hidden;
}
.custom-modal .modal-content {
  padding: 30px;
  text-align: center;
  background: #fafafa;
}
.custom-modal .modal-footer {
  background: #eeeeee;
  display: flex;
  justify-content: space-around;
}

/* Ladestatus */
.loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
}
.loading-message .material-icons {
  margin-right: 8px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
