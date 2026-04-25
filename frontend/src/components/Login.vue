<template>
  <div class="auth-form">
    <h2>🔑 Login</h2>
    <input v-model="email" placeholder="Email" class="input" />
    <input v-model="password" type="password" placeholder="Password" class="input" />
    <button @click="login" class="button">Login</button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import API from "../api";
export default {
  data() {
    return {
      email: "",
      password: "",
      error: "",
    };
  },
  methods: {
    async login() {
      this.error = "";
      try {
        const res = await API.user.post("/login", {
          email: this.email,
          password: this.password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("email", this.email);
        alert("✅ Logged in successfully!");
        this.$router.push("/dashboard");
      } catch (err) {
        this.error = err.response?.data?.error || "Login failed!";
      }
    },
  },
};
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 20px auto;
}
.input {
  width: 100%;
  padding: 8px;
  margin: 6px 0;
  background: #2c2c2c;
  color: white;
  border: 1px solid #444;
  border-radius: 5px;
}
.button {
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  background: #2980b9;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.button:hover {
  background: #1f6694;
}
.error {
  color: #ff4d4f;
}
</style>
