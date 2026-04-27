<template>
  <div class="restaurant-dashboard fade-up">
    <section class="panel">
      <h2>Quan ly nha hang</h2>
      <p class="hint">Chon nha hang de quan ly menu va don hang.</p>

      <div class="row">
        <select v-model="selectedRestaurantId" @change="loadRestaurantData" class="input">
          <option value="">-- Chon nha hang --</option>
          <option v-for="r in restaurants" :key="r._id" :value="r._id">{{ r.name }}</option>
        </select>
        <button class="btn" @click="loadRestaurants">Tai lai</button>
      </div>

      <div class="new-restaurant">
        <input v-model="newRestaurant.name" class="input" placeholder="Ten nha hang" />
        <input v-model="newRestaurant.address" class="input" placeholder="Dia chi" />
        <input v-model="newRestaurant.phone" class="input" placeholder="So dien thoai" />
        <textarea v-model="newRestaurant.description" class="input" placeholder="Mo ta"></textarea>
        <button class="btn primary" @click="createRestaurant">Tao nha hang</button>
      </div>
    </section>

    <section class="panel" v-if="selectedRestaurantId">
      <h2>Quan ly menu</h2>
      <div class="new-menu">
        <input v-model="newMenu.name" class="input" placeholder="Ten mon" />
        <input v-model.number="newMenu.price" type="number" class="input" placeholder="Gia" />
        <input v-model="newMenu.category" class="input" placeholder="Danh muc" />
        <textarea v-model="newMenu.description" class="input" placeholder="Mo ta"></textarea>
        <button class="btn primary" @click="createMenu">Them mon</button>
      </div>

      <ul class="menu-list" v-if="menus.length">
        <li v-for="m in menus" :key="m._id" class="menu-item">
          <div>
            <strong>{{ m.name }}</strong>
            <p>{{ m.price }} đ | {{ m.category || 'Khac' }}</p>
          </div>
          <div class="menu-actions">
            <button class="btn" @click="toggleAvailability(m)">
              {{ m.isAvailable ? 'Tam an' : 'Mo ban' }}
            </button>
            <button class="btn danger" @click="deleteMenu(m._id)">Xoa</button>
          </div>
        </li>
      </ul>
      <p v-else class="hint">Chua co mon nao.</p>
    </section>

    <section class="panel" v-if="selectedRestaurantId">
      <h2>Don hang nha hang</h2>
      <p class="hint">Nhan/Tu choi don va cap nhat trang thai xu ly.</p>

      <ul class="orders" v-if="orders.length">
        <li v-for="o in orders" :key="o._id" class="order-item">
          <div class="top">
            <strong>{{ o._id }}</strong>
            <span class="status">{{ o.status }}</span>
          </div>
          <p>Khach: {{ o.userEmail }}</p>
          <p>Tong tien: {{ o.totalPrice }} đ</p>
          <p>Dia chi: {{ o.deliveryAddress || 'N/A' }}</p>
          <p>Mon: {{ (o.items || []).map((i) => i.productName + ' x' + i.quantity).join(', ') }}</p>
          <div class="actions">
            <button class="btn" @click="setStatus(o._id, 'confirmed')">Nhan don</button>
            <button class="btn" @click="setStatus(o._id, 'preparing')">Dang nau</button>
            <button class="btn" @click="setStatus(o._id, 'ready')">San sang giao</button>
            <button class="btn danger" @click="rejectOrder(o)">Tu choi</button>
          </div>
        </li>
      </ul>
      <p v-else class="hint">Chua co don cho nha hang nay.</p>
    </section>
  </div>
</template>

<script>
import API from "../api";

export default {
  data() {
    return {
      restaurants: [],
      selectedRestaurantId: localStorage.getItem("restaurantId") || "",
      menus: [],
      orders: [],
      newRestaurant: {
        name: "",
        description: "",
        address: "",
        phone: "",
      },
      newMenu: {
        name: "",
        price: 0,
        description: "",
        category: "",
      },
      pollTimer: null,
    };
  },
  methods: {
    async loadRestaurants() {
      const res = await API.restaurant.get("/restaurants");
      this.restaurants = res.data;

      if (!this.selectedRestaurantId && this.restaurants.length > 0) {
        this.selectedRestaurantId = this.restaurants[0]._id;
      }

      if (this.selectedRestaurantId) {
        localStorage.setItem("restaurantId", this.selectedRestaurantId);
      }
    },
    async createRestaurant() {
      if (!this.newRestaurant.name.trim()) {
        return;
      }

      await API.restaurant.post("/restaurants", this.newRestaurant);
      this.newRestaurant = { name: "", description: "", address: "", phone: "" };
      await this.loadRestaurants();
      await this.loadRestaurantData();
    },
    async loadRestaurantData() {
      if (!this.selectedRestaurantId) return;

      localStorage.setItem("restaurantId", this.selectedRestaurantId);

      const [menuRes, orderRes] = await Promise.all([
        API.restaurant.get("/", {
          params: {
            restaurantId: this.selectedRestaurantId,
            includeUnavailable: true,
          },
        }),
        API.order.get("/", { params: { restaurantId: this.selectedRestaurantId } }),
      ]);

      this.menus = menuRes.data;
      this.orders = orderRes.data;
    },
    async createMenu() {
      if (!this.selectedRestaurantId || !this.newMenu.name.trim()) {
        return;
      }

      await API.restaurant.post("/", {
        ...this.newMenu,
        restaurantId: this.selectedRestaurantId,
      });

      this.newMenu = { name: "", price: 0, description: "", category: "" };
      await this.loadRestaurantData();
    },
    async toggleAvailability(menu) {
      await API.restaurant.put(`/${menu._id}`, {
        isAvailable: !menu.isAvailable,
      });
      await this.loadRestaurantData();
    },
    async deleteMenu(menuId) {
      await API.restaurant.delete(`/${menuId}`);
      await this.loadRestaurantData();
    },
    async setStatus(orderId, status) {
      await API.order.patch(`/${orderId}/status`, { status });
      await this.loadRestaurantData();
    },
    async rejectOrder(order) {
      await API.order.patch(`/${order._id}/status`, { status: "cancelled" });

      if (order.paymentStatus === "paid") {
        await API.payment.post("/refund", { orderId: order._id });
      }

      await this.loadRestaurantData();
    },
    setupPolling() {
      this.pollTimer = setInterval(() => {
        this.loadRestaurantData();
      }, 8000);
    },
  },
  async mounted() {
    await this.loadRestaurants();
    await this.loadRestaurantData();
    this.setupPolling();
  },
  beforeUnmount() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  },
};
</script>

<style scoped>
.restaurant-dashboard {
  display: grid;
  gap: 14px;
}

.panel {
  background: #ffffff;
  border: 1px solid rgba(23, 33, 47, 0.1);
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.11);
  padding: 16px;
}

h2 {
  font-size: 1.3rem;
  color: #12253a;
}

.hint {
  margin-top: 6px;
  color: #60728a;
}

.row,
.new-restaurant,
.new-menu {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.row {
  grid-template-columns: 1fr auto;
}

.input {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #cad8e4;
  background: #f8fbff;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 9px 12px;
  background: #d8eafb;
  color: #0f3d63;
  font-weight: 700;
  cursor: pointer;
}

.btn.primary {
  background: #d1fae5;
  color: #14532d;
}

.btn.danger {
  background: #fee2e2;
  color: #991b1b;
}

.menu-list,
.orders {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.menu-item,
.order-item {
  border: 1px solid #d7e5f2;
  border-radius: 10px;
  padding: 10px;
  background: #f8fbff;
}

.menu-item p,
.order-item p {
  margin-top: 4px;
  color: #60728a;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.menu-actions,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.status {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #0f5f77;
}
</style>
