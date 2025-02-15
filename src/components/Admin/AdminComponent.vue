<template>
  <div class="container">
    <div class="nav-wrapper">
      <div class="nav-card" v-for="(item, index) in navItems" :key="index">
        <div class="card-content">
          <h4 class="card-title">{{ item.title }}</h4>
          <p class="card-description">{{ item.description }}</p>
        </div>
        <div class="card-action">
          <button
            class="btn gradient-btn waves-effect waves-light"
            @click="navigateTo(item.path)"
          >
            {{ item.buttonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "NavigationButtons",
  setup() {
    const router = useRouter();

    const navigateTo = (path: string) => {
      router.push(path);
    };

    const navItems = [
      {
        title: "Datenbank bearbeiten",
        description:
          "Datenbank kann mit Sokrates CSV Dateien gelehrt bzw. befüllt werden.",
        buttonText: "Datenbank bearbeiten",
        path: "/admin/database",
      },
      {
        title: "Klassenvorstand bearbeiten",
        description:
          "Klassenvorstand einer Klasse ändern bzw. hinzufügen (wie es bei der 5. Klasse der Fall ist).",
        buttonText: "Klassenvorstand bearbeiten",
        path: "/admin/editkv",
      },
      {
        title: "Schüler bearbeiten",
        description:
          "Alle Schüler werden hier angezeigt, welche gefiltert und gelöscht werden können. Gleichzeitig kann auch ein neuer Schüler angelegt werden.",
        buttonText: "Schüler bearbeiten",
        path: "/admin/editStudents",
      },
      {
        title: "Lehrer bearbeiten",
        description:
          "Alle Lehrer werden hier angezeigt, welche gefiltert und gelöscht werden können. Gleichzeitig kann auch ein neuer Lehrer angelegt werden. (Beachte: Das Erstellen eines neuen Lehrers funktioniert noch nicht wie erwartet.)",
        buttonText: "Lehrer bearbeiten",
        path: "/admin/editTeachers",
      },
    ];

    return {
      navigateTo,
      navItems,
    };
  },
});
</script>

<style scoped>
.container {
  margin-top: 50px;
}

/* Wrapper so anpassen, dass keine Overflow-Abschneidung erfolgt */
.nav-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: visible;
  padding-bottom: 50px; /* sorgt dafür, dass der Shadow der letzten Karte nicht abgeschnitten wird */
}

/* Navigation-Card mit Ampel-Gradient (dezent) */
.nav-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  color: #333;
  overflow: visible; /* sicherstellen, dass der Shadow nicht abgeschnitten wird */
}

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3);
}

/* Typografie für Titel und Beschreibung */
.card-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.card-description {
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

/* Gradient Button */
.gradient-btn {
  background: linear-gradient(45deg, #c9302c, #ec971f);

  border: none;
  color: #fff;
  text-transform: uppercase;
  font-weight: bold;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.gradient-btn:hover {
  background: linear-gradient(45deg, #cc0f08, #e98801);
}

/* Optional: Anpassung für Materialize Waves */
.waves-effect.waves-light {
  color: #fff;
}
</style>
