<template>
<p>{{ output }}</p>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
const output = ref('');

const fetchSubjects = async () => {
  try {
    const response = await axios.get('/api/teacher-ampel/getLehrer');
    output.value = response.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
  }
};
onMounted(fetchSubjects);
</script>