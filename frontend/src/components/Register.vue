<template>
  <div class="auth-page fade-up">
    <div class="auth-form">
      <h2>Dang ky</h2>
      <p class="sub">Tao tai khoan moi de bat dau dat don.</p>

      <input v-model="name" placeholder="Ho va ten" class="input" />
      <input v-model="email" placeholder="Email" class="input" />
      <input v-model="password" type="password" placeholder="Password" class="input" />
      <select v-model="role" class="input">
        <option value="customer">Customer</option>
        <option value="restaurant">Restaurant</option>
        <option value="driver">Driver</option>
      </select>

      <button @click="register" class="button">Dang ky</button>
      <router-link to="/login" class="link">Da co tai khoan? Dang nhap</router-link>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import API from "../api";
export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      role: "customer",
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
      if (!this.name.trim()) {
        this.error = "❌ Vui long nhap ho ten";
        return;
      }

      if (!this.isEmailValid(this.email)) {
        this.error = "❌ Invalid email!";
        return;
      }

      if (this.password.length < 6) {
        this.error = "❌ Password can it nhat 6 ky tu";
        return;
      }

      try {
        await API.user.post("/register", {
          name: this.name,
          email: this.email,
          password: this.password,
          role: this.role,
        });
        alert("✅ Registration successful!");
        this.$router.push("/login");
      } catch (err) {
        this.error = err.response?.data?.error || "Registration failed!";
      }
    },
  },
};
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 80px);
  display: grid;
  place-items: center;
}

.auth-form {
  width: min(460px, 100%);
  background: #ffffff;
  border-radius: 18px;
  padding: 26px 22px;
  border: 1px solid rgba(23, 33, 47, 0.09);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
}

h2 {
  font-size: 30px;
  color: #102437;
}

.sub {
  color: #58687e;
  margin: 8px 0 14px;
}

.input {
  width: 100%;
  padding: 11px 12px;
  margin: 6px 0;
  background: #f8fbff;
  color: #1f2937;
  border: 1px solid #cad8e4;
  border-radius: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #0e7490;
  box-shadow: 0 0 0 4px rgba(14, 116, 144, 0.18);
}

.button {
  width: 100%;
  padding: 11px;
  margin-top: 10px;
  background: linear-gradient(135deg, #0e7490, #155e75);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
}

.link {
  margin-top: 12px;
  display: inline-block;
  color: #0f5f77;
  font-weight: 600;
}

.error {
  color: #dc2626;
  margin-top: 10px;
}
</style>
