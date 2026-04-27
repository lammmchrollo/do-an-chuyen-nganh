<template>
  <div class="dashboard fade-up">
    <header class="topbar">
      <div>
        <p class="label">Xin chao ban tro lai</p>
        <h1>{{ userName || userEmail }}</h1>
        <p class="role">Vai tro: {{ userRole || 'customer' }}</p>
      </div>
      <button @click="logout" class="logout-btn">Dang xuat</button>
    </header>

    <template v-if="userRole === 'restaurant'">
      <section class="section">
        <RestaurantDashboard />
      </section>
    </template>

    <template v-else>
      <section class="section">
        <ProductList />
      </section>
      <section class="section split">
        <OrderForm />
        <OrderHistory />
      </section>
      <section class="section">
        <DeliveryTracking />
      </section>
    </template>
  </div>
</template>

<script>
import ProductList from "./ProductList.vue";
import OrderForm from "./OrderForm.vue";
import OrderHistory from "./OrderHistory.vue";
import DeliveryTracking from "./DeliveryTracking.vue";
import RestaurantDashboard from "./RestaurantDashboard.vue";

export default {
  components: {
    ProductList,
    OrderForm,
    OrderHistory,
    DeliveryTracking,
    RestaurantDashboard,
  },
  data() {
    return {
      userEmail: "",
      userName: "",
      userRole: "customer",
    };
  },
  mounted() {
    const token = localStorage.getItem("token");
    if (!token) {
      this.$router.push("/login");
      return;
    }

    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    this.userEmail = localStorage.getItem("email") || "";
    this.userName = user?.name || "";
    this.userRole = user?.role || "customer";
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.dashboard {
  display: grid;
  gap: 20px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(23, 33, 47, 0.09);
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
  padding: 14px 16px;
}

.label {
  color: #5f6f85;
  font-size: 13px;
}

.role {
  margin-top: 6px;
  color: #0f5f77;
  font-weight: 700;
  font-size: 0.9rem;
}

h1 {
  font-size: clamp(18px, 2.8vw, 26px);
  color: #12253a;
  margin-top: 4px;
  word-break: break-word;
}

.logout-btn {
  border: none;
  border-radius: 10px;
  padding: 9px 14px;
  background: #efe1dc;
  color: #7b2714;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.logout-btn:hover {
  transform: translateY(-1px);
}

.section {
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(23, 33, 47, 0.08);
  border-radius: 16px;
  padding: 10px;
  backdrop-filter: blur(4px);
}

.split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

@media (max-width: 640px) {
  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .logout-btn {
    width: 100%;
  }
}
</style>
