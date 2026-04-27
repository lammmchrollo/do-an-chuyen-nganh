<template>
  <div class="product-list fade-up">
    <h2>Tim nha hang va chon mon</h2>
    <p class="intro">Tim theo ten nha hang/mon an, them vao gio de tao don nhanh.</p>

    <div class="search-row">
      <input v-model="keyword" @input="loadData" class="search-input" placeholder="Tim nha hang, mon an..." />
      <select v-model="selectedRestaurantId" @change="loadMenus" class="search-input">
        <option value="">Tat ca nha hang</option>
        <option v-for="r in restaurants" :key="r._id" :value="r._id">{{ r.name }}</option>
      </select>
    </div>

    <div class="grid" v-if="menus.length > 0">
      <article v-for="p in menus" :key="p._id" class="product-card">
        <p class="restaurant-name">{{ p.restaurantId?.name || 'Nha hang' }}</p>
        <h3>{{ p.name }}</h3>
        <p>{{ p.description }}</p>
        <div class="foot">
          <strong>{{ p.price }} đ</strong>
          <button @click="addToCart(p)">Them vao gio</button>
        </div>
      </article>
    </div>

    <p v-else class="empty">Khong tim thay mon an phu hop.</p>
  </div>
</template>

<script>
import API from "../api";

export default {
  data() {
    return {
      keyword: "",
      selectedRestaurantId: "",
      restaurants: [],
      menus: [],
    };
  },
  methods: {
    async loadData() {
      try {
        const [restaurantRes, menuRes] = await Promise.all([
          API.restaurant.get("/restaurants", { params: { q: this.keyword } }),
          API.restaurant.get("/", {
            params: {
              q: this.keyword,
              restaurantId: this.selectedRestaurantId || undefined,
            },
          }),
        ]);

        this.restaurants = restaurantRes.data;
        this.menus = menuRes.data;
      } catch (err) {
        console.error("Cannot load restaurants/menus", err);
      }
    },
    async loadMenus() {
      await this.loadData();
    },
    addToCart(product) {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existed = cart.find((item) => item.productId === product._id);

      if (existed) {
        existed.quantity += 1;
      } else {
        cart.push({
          productId: product._id,
          productName: product.name,
          unitPrice: product.price,
          quantity: 1,
          restaurantId: product.restaurantId?._id || product.restaurantId,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
    },
  },
  mounted() {
    this.loadData();
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

.search-row {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 10px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cad8e4;
  background: #f8fbff;
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

.restaurant-name {
  color: #a6ecff;
  font-size: 0.86rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.product-card p {
  color: #d5deea;
  font-size: 0.95rem;
  flex: 1;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.foot button {
  border: none;
  border-radius: 9px;
  padding: 8px 10px;
  font-weight: 700;
  cursor: pointer;
  background: #cffce5;
  color: #14532d;
}

.product-card strong {
  color: #62f0ad;
  font-size: 1.02rem;
}

.empty {
  margin-top: 14px;
  color: #5a6778;
}

@media (max-width: 800px) {
  .search-row {
    grid-template-columns: 1fr;
  }
}
</style>
