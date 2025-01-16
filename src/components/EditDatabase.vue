<template>
    <div class="container">
      <div class="file-input">
        <input type="file" id="file" accept=".csv" @change="onFileSelected" />
        <label for="file" class="btn">Choose CSV File</label>
        <button class="btn green" :disabled="!selectedFile" @click="openModal('upload')">Upload CSV</button>
        <button class="btn red" @click="openModal('delete')">Delete CSV</button>
      </div>
  
      <!-- Modal für Bestätigungen -->
      <div id="confirmation-modal" class="modal">
        <div class="modal-content">
          <h4>Bestätigung</h4>
          <p>{{ modalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="modal-close btn grey" @click="cancelAction">Zurück</button>
          <button class="btn blue" @click="proceedAction">Ja</button>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import axios from 'axios';
  import M from 'materialize-css';
  
  export default defineComponent({
    name: 'CsvUploader',
    setup() {
      const selectedFile = ref<File | null>(null);
      const modalInstance = ref<M.Modal | null>(null);
      const modalMessage = ref('');
      const action = ref<() => void>(() => {});
  
      // Initialisiere Materialize-Modals
      onMounted(() => {
        const modalElement = document.getElementById('confirmation-modal');
        if (modalElement) {
          modalInstance.value = M.Modal.init(modalElement);
        }
      });
  
      const onFileSelected = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          const file = target.files[0];
          if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            selectedFile.value = file;
          } else {
            M.toast({ html: 'Only CSV files are allowed.', classes: 'red' });
            selectedFile.value = null;
          }
        }
      };
  
      const openModal = (type: string) => {
        if (type === 'upload' && !selectedFile.value) {
          M.toast({ html: 'No file selected.', classes: 'red' });
          return;
        }
  
        modalMessage.value =
          type === 'upload'
            ? 'Bist du sicher, dass du die Datei hochladen möchtest?'
            : 'Bist du sicher, dass du die gesamte Datenbank leeren möchtest?';
  
        action.value = type === 'upload' ? uploadCsvFile : deleteCsv;
  
        modalInstance.value?.open();
      };
  
      const uploadCsvFile = async () => {
        const formData = new FormData();
        formData.append('file', selectedFile.value!);
  
        try {
          const response = await axios.post('/api/admin/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          M.toast({ html: 'File uploaded successfully!', classes: 'green' });
          console.log('Response:', response.data);
          selectedFile.value = null;
        } catch (error) {
          console.error('Error uploading file:', error);
          M.toast({ html: 'An error occurred while uploading the file.', classes: 'red' });
        } finally {
          modalInstance.value?.close();
        }
      };
  
      const deleteCsv = async () => {
        try {
          const response = await axios.delete('/api/admin/deleteAll');
          M.toast({ html: 'Database cleared successfully!', classes: 'green' });
          console.log('Response:', response.data);
        } catch (error) {
          console.error('Error deleting file:', error);
          M.toast({ html: 'An error occurred while clearing the database.', classes: 'red' });
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
  