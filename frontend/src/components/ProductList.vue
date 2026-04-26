<template>
  <div class="product-list fade-up">
    <h2>Danh sach dich vu</h2>
    <p class="intro">Chon dich vu phu hop, tao don nhanh va theo doi trang thai theo thoi gian thuc.</p>
    <div class="grid">
      <article v-for="p in products" :key="p._id" class="product-card">
        <h3>{{ p.name }}</h3>
        <p>{{ p.description }}</p>
        <strong>{{ p.price }} đ</strong>
      </article>
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
  max-width: 980px;
  margin: 14px auto;
  text-align: left;
}

h2 {
  font-size: clamp(24px, 3.6vw, 34px);
  color: #0f253a;
}

.intro {
  margin-top: 8px;
  color: #5a6778;
}

.grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.product-card {
  background: linear-gradient(165deg, #111216 0%, #1a1e26 65%, #243041 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px;
  border-radius: 14px;
  min-height: 184px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.35);
}

.product-card h3 {
  font-size: 1.06rem;
  color: #ffe08a;
}

.product-card p {
  color: #d5deea;
  font-size: 0.95rem;
  flex: 1;
}

.product-card strong {
  color: #62f0ad;
  font-size: 1.02rem;
}
</style>
