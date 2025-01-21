<template>
    <!-- Legende, die einklappbar ist -->
    <div class="legend">
      <transition name="">
        <div style="  background-color: white;">
          <div v-if="legendVisible" class="flex-container-Legend">
            <div class="flex-container-Horizontal">
              <img class="imgHeight" src="@/assets/Ampel_grün.png" />
  
              <div class="flex-container-Vertical center-align">
                <h6 class="green roundedCorners" style="max-width: fit-content">Grün</h6>
                <h6>Positiv</h6>
              </div>
            </div>
  
            <div class="flex-container-Horizontal">
              <img class="imgHeight" src="@/assets/Ampel_gelb.png" />
  
              <div class="flex-container-Vertical center-align">
                <h6 class="yellow roundedCorners" style="max-width: fit-content">Gelb</h6>
                <h6>Fast Negativ</h6>
              </div>
            </div>
  
            <div class="flex-container-Horizontal">
              <img class="imgHeight" src="@/assets/Ampel_rot.png" />
  
              <div class="flex-container-Vertical center-align">
                <h6 class="red roundedCorners" style="max-width: fit-content">Rot</h6>
                <h6>Negativ</h6>
              </div>
            </div>
  
            <div class="flex-container-Horizontal">
              <img class="imgHeight" src="@/assets/Ampel_schwarz.png" />
  
              <div class="flex-container-Vertical center-align">
                <h6 class="black roundedCorners white-text" style="max-width: fit-content">
                  Schwarz
                </h6>
                <h6>Nicht beurteilt</h6>
              </div>
            </div>
          </div>
          <div class="flex-center">
            <button @click="toggleLegend" class="waves-effect waves-light btn"  v-if="legendVisible">
              <i class="material-icons" >arrow_upward</i>
            </button>
  
            <button @click="toggleLegend" class="waves-effect waves-light btn" style="margin:10px" v-else>
              <i class="material-icons" >arrow_downward</i>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </template>
  <script>
  export default {
    data() {
      return {
        legendVisible: true,
      };
    },
    methods: {
      toggleLegend() {
        this.legendVisible = !this.legendVisible;
      },
    },
  };
  </script>
  
  <style scoped>
  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .flex-container-Legend {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .flex-container-Horizontal {
    display: flex;
  }
  
  .flex-container-Vertical {
    display: flex;
    flex-direction: column;
  }
  
  .imgHeight {
    height: 100px;
  }
  
  .roundedCorners {
    padding: 10px;
    border-radius: 10px;
  }
  
  .slideTransition {
    transition: all 0.5s ease;
  }
  
  .slide-fade-enter,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
  </style>
  