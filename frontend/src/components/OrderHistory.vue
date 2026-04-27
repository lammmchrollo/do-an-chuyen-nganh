<template>
  <div class="order-container fade-up">
    <h2>Lich su don hang</h2>
    <ul v-if="orders.length > 0" class="order-list">
      <li v-for="order in orders" :key="order._id" class="order-item">
        <div class="row">
          <strong>{{ getOrderTitle(order) }}</strong>
          <span class="price">{{ order.totalPrice }} đ</span>
        </div>
        <div class="meta">
          <span>So mon: {{ order.items ? order.items.length : 0 }}</span>
          <span>{{ formatDate(order.createdAt) }}</span>
        </div>
        <div class="meta">
          <span>Thanh toan: <strong>{{ order.paymentStatus || 'unpaid' }}</strong></span>
          <span>Tam tinh: {{ order.subtotal || 0 }} đ</span>
        </div>
        <div class="meta status-row">
          <span>
            Trang thai don:
            <strong :class="['status', order.status || 'pending']">{{ order.status || "pending" }}</strong>
          </span>
          <span v-if="order.deliveryAddress">{{ order.deliveryAddress }}</span>
        </div>
        <div class="actions">
          <button @click="updateStatus(order._id, 'confirmed')">Confirmed</button>
          <button @click="updateStatus(order._id, 'preparing')">Preparing</button>
          <button @click="updateStatus(order._id, 'ready')">Ready + Assign</button>
          <button
            v-if="order.status === 'waiting_for_driver'"
            class="retry"
            @click="dispatchOrder(order._id)"
          >
            Thu lai gan tai xe
          </button>
          <button @click="updateStatus(order._id, 'completed')">Completed</button>
          <button class="cancel" @click="updateStatus(order._id, 'cancelled')">Cancelled</button>
        </div>
      </li>
    </ul>
    <p v-else class="empty">Chua co don hang nao.</p>
  </div>
</template>

<script>
import API from "../api";

export default {
  data() {
    return {
      orders: [],
    };
  },
  methods: {
    async fetchOrders() {
      const email = localStorage.getItem("email");
      if (!email) return;
      try {
        const orderRes = await API.order.get(`/user/${email}`);
        this.orders = orderRes.data;
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err);
      }
    },
    async updateStatus(orderId, status) {
      try {
        await API.order.patch(`/${orderId}/status`, { status });
        await this.fetchOrders();
        window.dispatchEvent(new Event("order-updated"));
      } catch (err) {
        console.error("❌ Cannot update order status:", err);
        alert(err.response?.data?.error || "Khong cap nhat duoc trang thai don hang");
      }
    },
    async dispatchOrder(orderId) {
      try {
        await API.order.patch(`/${orderId}/dispatch`);
        await this.fetchOrders();
        window.dispatchEvent(new Event("order-updated"));
      } catch (err) {
        console.error("❌ Cannot dispatch order:", err);
        alert(err.response?.data?.error || "Khong the thu lai gan tai xe");
      }
    },
    formatDate(d) {
      return new Date(d).toLocaleString("en-US");
    },
    getOrderTitle(order) {
      if (!order.items || order.items.length === 0) {
        return "Don hang";
      }

      if (order.items.length === 1) {
        return order.items[0].productName;
      }

      return `${order.items[0].productName} +${order.items.length - 1} mon`;
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
  max-width: 520px;
  margin: 16px auto;
  padding: 20px;
  border: 1px solid rgba(23, 33, 47, 0.1);
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.11);
  text-align: left;
}

h2 {
  font-size: 1.45rem;
  color: #12253a;
  margin-bottom: 10px;
}

.order-list {
  list-style: none;
  margin: 0;
  padding: 20px;
}

.order-item {
  background: #f8fbff;
  border: 1px solid #d7e5f2;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: baseline;
}

.meta {
  margin-top: 6px;
  color: #5f6f85;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.92rem;
}

.status-row {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #c7d8e6;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.actions button {
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  background: #d7e9f7;
  color: #0f3d63;
  font-weight: 700;
  cursor: pointer;
}

.actions button.cancel {
  background: #fde2e2;
  color: #8a2222;
}

.actions button.retry {
  background: #fef3c7;
  color: #92400e;
}

.status {
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.status.pending,
.status.confirmed,
.status.preparing,
.status.ready {
  background: #e0f2fe;
  color: #0c4a6e;
}

.status.waiting_for_driver {
  background: #fef3c7;
  color: #92400e;
}

.status.delivering,
.status.completed {
  background: #dcfce7;
  color: #166534;
}

.status.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.price {
  color: #0f9d5d;
  font-weight: 700;
}

.empty {
  color: #66758a;
}
</style>
