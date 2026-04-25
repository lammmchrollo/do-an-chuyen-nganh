<template>
  <div class="product-list">
    <h2>📦 Service List</h2>
    <div v-for="p in products" :key="p._id" class="product-card">
      <h3>
        {{ p.name }} <span>- {{ p.price }} đ</span>
      </h3>
      <p>{{ p.description }}</p>
    </div>
  </div>
</template>

<script>
import API from "../api";

export default {
  data() {
    return { products: [] };
  },
  async mounted() {
    try {
      const res = await API.restaurant.get("/");
      this.products = res.data;
    } catch (err) {
      console.error("❌ Failed to load the service list:", err);
    }
  },
};
</script>

<style scoped>
.product-list {
  max-width: 800px;
  margin: 30px auto;
}
.product-card {
  background: #1e1e1e;
  border: 1px solid #333;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 15px;
}
.product-card h3 {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 1.1em;
  color: #f1c40f;
}
.product-card p {
  color: #ccc;
  font-size: 0.95em;
}
</style>
