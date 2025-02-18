<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <form @submit.prevent="login" class="login-form">
          <div class="input-group">
            <label for="username">Username:</label>
            <input type="text" v-model="form.username" placeholder="Enter your username" required/>
          </div>
          <div class="input-group">
            <label for="password">Password:</label>
            <input type="password" v-model="form.password" placeholder="Enter your password" required/>
          </div>
          <button @click="login">Log In</button>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useAuthenticationStore } from "@/stores/AuthenticationStore.ts"
import type { LoginRequest } from "@/types/LoginRequest.ts"
import { useRouter } from "vue-router"
import { Roles } from "@/enum/Roles.ts"
const authenticationStore = useAuthenticationStore()
const router = useRouter()

const form = ref<LoginRequest>({
  username: "nribinin",
  password: "",
  simulate: true
})

async function login() {
  const sucessful = await authenticationStore.login(form.value)
  if (sucessful) {
    if(authenticationStore.roles.includes(Roles.STUDENT)) {
      router.push("/schueler")
    } else if(authenticationStore.roles.includes(Roles.TEACHER)) {
      router.push("/lehrer")
    }
  }
}
</script>

<style>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-image: url('@/assets/TGM_blau.jpg');
  background-size: cover;
  background-position: center;
}

.login-container {
  text-align: center;
  color: white;
  padding: 2.5em;
  border-radius: 0.5em;
}

.login-box {
  width: 31.25em;
  background-color: white;
  padding: 1.25em;
  border-radius: 0.5em;
  box-shadow: 0 0.25em 0.5em rgba(0, 0, 0, 0.2);
}

.login-box label {
  display: block;
  text-align: left;
  margin-bottom: 0.3125em;
  font-size: 0.875em;
  color: #333;
}

.login-box input {
  width: 100%;
  padding: 0.625em;
  margin: 0.625em 0;
  border: 0.0625em solid #ccc;
  border-radius: 0.25em;
  font-size: 1em;
}

.login-box button {
  width: 100%;
  padding: 0.625em;
  background-color: #2b3d4f;
  color: white;
  font-size: 1em;
  border: none;
  border-radius: 0.25em;
  cursor: pointer;
}

.login-box button:hover {
  background-color: #1f2c3a;
}

/* Media Queries für mobile Ansicht */
@media (max-width: 30em) {
  .login-box {
    width: 200%;
    padding: 1em;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }

  .login-box h1 {
    font-size: 1.25em;
  }

  .login-box p {
    font-size: 0.875em;
  }

  .login-box label {
    font-size: 0.75em;
  }

  .login-box input, .login-box button {
    padding: 0.5em;
  }
}
</style>