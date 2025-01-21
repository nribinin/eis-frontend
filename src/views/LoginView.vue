<template>
    <div class="maincontainer">
        <div class="fixed headcontainer">
            <div class="header">
                <nav>
                    <ul>
                        <li> 
                            <img src="@/assets/eis_logo_weiss.png" class="header-logo">
                        </li>
                        <div>
                            <li>
                                <router-link to="/" @click="changeView('Login', 'Anmeldeseite')"
                                    :class="{ 'selectedSite': activeComponent === 'Login' }">Anmeldeseite</router-link>
                            </li>
                            <li>
                                <router-link to="/" @click="changeView('Lernbetreuung', 'Lernbetreuung')"
                                    :class="{ 'selectedSite': activeComponent === 'Lernbetreuung' }">Lernbetreuung</router-link>
                            </li>
                        </div>
                    </ul>
                </nav>
            </div>
        </div>
        <component :is="activeComponent" />
        <footer class="footer">
            <img src="@/assets/eis_logo_weiss.png" class="footer-logo">
            <p>Eine Diplomarbeit für das Elterninformationssystem</p>
        </footer>
    </div>
</template>

<script>
import Login from '@/components/Login/LoginComponent.vue';
import Lernbetreuung from '@/components/Login/LernbetreuungComponent.vue';

export default {
    data() {
        return {
            activeComponent: 'Login',
            title: 'Anmeldeseite',
        };
    },
    methods: {
        changeView(componentName, newTitle) {
            this.activeComponent = componentName;
            this.title = newTitle;
        },
    },
    components: {
        Login,
        Lernbetreuung
    },
};
</script>

<style scoped>
.maincontainer {
    overflow-y: auto;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    width: 100%;
}

.header-logo{
    width: 100px;
}

.fixed {
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 1000;
}


nav ul {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
    background-color: black;
}

h3 {
    margin: 0 !important;
    margin-left: 0.5em !important;
}

.selectedSite {
    color: #000000;
    background-color: #ffffff;
}

.selectedSite:hover {
    color: #000000;
    background-color: #cdc1c1;
}

.footer {
    background-color: black;
    color: white;
    text-align: center;
    padding: 1em 0;
    margin-top: auto;
}

.footer-logo {
    width: 65px;
    height: auto;
}

.footer h2 {
    font-size: 1.5em;
    margin: 0;
}

.footer p {
    margin: 0.5em 0 0;
    font-size: 1em;
    color: #ffffff;
}
</style>
