<template>
  <div class="content">
    <section class="ilb-section">
      <h2>Individuelle Lernbegleitung</h2>
      <p>
        Eine innovative Maßnahme im Rahmen der neuen Oberstufe zur Unterstützung
        von Schülerinnen und Schülern beim Lernprozess!
      </p>
      <h3>Wer hat Anspruch auf ILB?</h3>
      <p>
        Alle Schüler/innen, die entweder eine Frühwarnung haben oder sich auf
        eine Semesterprüfung vorbereiten.
      </p>
      <h3>Was ist ILB?</h3>
      <ul>
        <li>Bestimmen von Lernzielen</li>
        <li>Erarbeiten neuer Lernstrategien</li>
        <li>Entwickeln von Lösungs- und Umsetzungsstrategien</li>
        <li>Einteilen der Lernzeiten</li>
        <li>Sichtbar machen von Lernerfolgen</li>
      </ul>
      <h3>Was ist ILB nicht?</h3>
      <ul>
        <li>kein Förderunterricht</li>
        <li>keine schulpsychologische Beratung</li>
        <li>kein Coaching</li>
        <li>keine Bildungsstrategie</li>
      </ul>
      <h3>Wie beginnt man ILB?</h3>
      <p>
        Wenn man sich im Lernprozess individuell unterstützen lassen möchte,
        sucht man sich einen Lernbegleiter / eine Lernbegleiterin der Abteilung
        aus. Dabei kann man sich auch gerne vom Klassenvorstand / der
        Klassenvorständin unterstützen lassen.
      </p>
      <h3>Wann endet ILB?</h3>
      <ul>
        <li>Sobald das Ziel erreicht ist</li>
        <li>
          Wenn der Schüler / die Schülerin die individuelle Lernbegleitung
          abbricht
        </li>
        <li>
          Wenn der Lernbegleiter / die Lernbegleiterin die individuelle
          Lernbegleitung abbricht
        </li>
      </ul>
      <h3>Wer bietet ILB an unserer Abteilung an?</h3>
    </section>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "ILBSection",
});
</script>

<style scoped>
.content {
  padding: 2em;
  background-image: url("@/assets/TGM_blau.jpg");
  background-size: cover;
  background-position: center;
  color: #000;
  display: flex;
  justify-content: center;
}

.ilb-section {
  background: #fff;
  padding: 2em;
  border-radius: 0.5em;
  box-shadow: 0 0.5em 1em rgba(0, 0, 0, 0.1);
  max-width: 100%;
  width: 1200px;
  box-sizing: border-box;
}

h2 {
  margin-bottom: 1em;
  font-size: 2em;
  text-align: center;
}

h3 {
  margin-bottom: 1em;
  color: turquoise;
}

p {
  margin-bottom: 1em;
  font-size: 1em;
  line-height: 1.5;
}

ul {
  margin: 1em 0;
  padding-left: 2em;
}

@media (max-width: 768px) {
  .ilb-section {
    padding: 1.5em;
    width: 100%;
  }
  h2 {
    font-size: 1.8em;
  }
  h3 {
    font-size: 1.4em;
  }
  p, ul {
    font-size: 0.9em;
  }
}

@media (max-width: 480px) {
  .ilb-section {
    padding: 1em;
  }
  h2 {
    font-size: 1.6em;
  }
  h3 {
    font-size: 1.2em;
  }
  p, ul {
    font-size: 0.8em;
  }
}
</style>