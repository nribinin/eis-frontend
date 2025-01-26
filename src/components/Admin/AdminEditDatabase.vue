<template>
  <div class="container">
    <h4>
      BEACHTE! Ist die Datenbank bereits mit Daten befüllt und du versucht Daten
      hochzuladen, dann könntest du Probleme verursachen!
    </h4>
    <div class="file-input">
      <input
        type="file"
        id="file"
        accept=".csv"
        @change="onFileSelected"
        hidden
      />
      <label for="file" class="btn">Sokrates Datei auswählen</label>
      <button
        class="btn green"
        :disabled="!selectedFile"
        @click="openModal('upload')"
      >
        Datenbank befüllen
      </button>
      <button class="btn red" @click="openModal('delete')">
        Datenbank leeren
      </button>
    </div>

    <!-- Modal für Bestätigungen -->
    <div id="confirmation-modal" class="modal">
      <div class="modal-content">
        <h4>Bestätigung</h4>
        <p>{{ modalMessage }}</p>
      </div>
      <div class="modal-footer">
        <button class="modal-close btn grey" @click="cancelAction">
          Zurück
        </button>
        <button class="btn blue" @click="proceedAction">Ja</button>
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
    const action = ref<() => void>(() => {});

    onMounted(() => {
      const modalElement = document.getElementById("confirmation-modal");
      if (modalElement) {
        modalInstance.value = M.Modal.init(modalElement);
      }
    });

    const onFileSelected = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (file.type === "text/csv" || file.name.endsWith(".csv")) {
          selectedFile.value = file;
        } else {
          snackbar.push("Nur CSV Dateien sind erlaubt");
          selectedFile.value = null;
        }
      }
    };

    const openModal = (type: string) => {
      if (type === "upload" && !selectedFile.value) {
        M.toast({ html: "No file selected.", classes: "red" });
        return;
      }

      modalMessage.value =
        type === "upload"
          ? "Bist du sicher, dass du die Datei hochladen möchtest?"
          : "Bist du sicher, dass du die gesamte Datenbank leeren möchtest?";

      action.value = type === "upload" ? uploadCsvFile : deleteCsv;

      modalInstance.value?.open();
    };

    const uploadCsvFile = async () => {
      const formData = new FormData();
      formData.append("file", selectedFile.value!);

      try {
        const response = await axios.post("/admin/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        snackbar.push("Datenbank erfolgreich befüllt");
        selectedFile.value = null;
      } catch (error) {
        snackbar.push("Es ist ein Fehler aufgetreten" + error);
      } finally {
        modalInstance.value?.close();
      }
    };

    const deleteCsv = async () => {
      try {
        const response = await axios.delete("/admin/deleteAll");
        snackbar.push("Datenbank erfolhrecih geleert");
      } catch (error) {
        snackbar.push("Es ist ein Fehler aufgetreten" + error);
      } finally {
        modalInstance.value?.close();
      }
    };

    const proceedAction = () => {
      action.value();
    };

    const cancelAction = () => {
      modalInstance.value?.close();
    };

    return {
      selectedFile,
      modalMessage,
      openModal,
      proceedAction,
      cancelAction,
      onFileSelected,
    };
  },
});
</script>

<style scoped>
.container {
  margin-top: 50px;
  text-align: center;
}

.file-input {
  margin-bottom: 20px;
}

.modal {
  max-width: 400px;
}

button {
  margin: 5px;
}
</style>
