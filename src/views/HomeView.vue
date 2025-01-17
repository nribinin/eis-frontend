<template>
  <div>
    <nav>
      <ul>
        <li><router-link to="/">Login Ansicht</router-link></li>
        <li><router-link to="/admin">Admin Ansicht</router-link></li>
        <li><router-link to="/lehrer">Lehrer Ansicht</router-link></li>
        <li><router-link to="/schueler">Schüler Ansicht</router-link></li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: "NavigationComponent"
}
</script>

<style scoped>
nav ul {
  list-style-type: none;
  padding: 0;
}

nav ul li {
  display: inline;
  margin-right: 10px;
}

router-link {
  text-decoration: none;
  color: blue;
}

router-link-active {
  font-weight: bold;
}
</style>
