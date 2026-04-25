<template>
  <div class="order-container">
    <h2>📜 Order History</h2>
    <ul v-if="orders.length > 0">
      <li v-for="order in orders" :key="order._id">
        🧾 <strong>{{ getProductName(order.productId) }}</strong> | Quantity: {{ order.quantity }} |
        Total: {{ order.totalPrice }} đ | Time: {{ formatDate(order.createdAt) }}
      </li>
    </ul>
    <p v-else>No orders found.</p>
  </div>
</template>

<script>
import API from "../api";

export default {
  data() {
    return {
      orders: [],
      products: [],
    };
  },
  methods: {
    async fetchOrders() {
      const email = localStorage.getItem("email");
      if (!email) return;
      try {
        const [orderRes, productRes] = await Promise.all([
          API.order.get(`/user/${email}`),
          API.restaurant.get("/"),
        ]);
        this.orders = orderRes.data;
        this.products = productRes.data;
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err);
      }
    },
    formatDate(d) {
      return new Date(d).toLocaleString("en-US");
    },
    getProductName(id) {
      const found = this.products.find((p) => p._id === id);
      return found ? found.name : id;
    },
  },
  mounted() {
    this.fetchOrders();

    window.addEventListener("order-updated", this.fetchOrders);
  },
  beforeUnmount() {
    window.removeEventListener("order-updated", this.fetchOrders);
  },
};
</script>

<style scoped>
.order-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}
li {
  margin-bottom: 10px;
  border-bottom: 1px dashed #555;
  padding-bottom: 5px;
}
</style>
