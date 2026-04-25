<template>
  <div class="auth-form">
    <h2>🔐 Register</h2>
    <input v-model="email" placeholder="Email" class="input" />
    <input v-model="password" type="password" placeholder="Password" class="input" />
    <button @click="register" class="button">Register</button>
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
    isEmailValid(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },
    async register() {
      this.error = "";
      if (!this.isEmailValid(this.email)) {
        this.error = "❌ Invalid email!";
        return;
      }
      try {
        await API.user.post("/register", {
          email: this.email,
          password: this.password,
        });
        alert("✅ Registration successful!");
        this.$router.push("/");
      } catch (err) {
        this.error = err.response?.data?.error || "Registration failed!";
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
