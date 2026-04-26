<template>
  <div class="tracking-wrap fade-up">
    <div class="panel tracking-panel">
      <h2>Theo doi giao hang</h2>
      <p class="hint">Danh sach don cua ban va trang thai giao hang hien tai.</p>

      <div v-if="loading" class="empty">Dang tai du lieu giao hang...</div>
      <div v-else-if="trackedOrders.length === 0" class="empty">
        Chua co don nao de theo doi.
      </div>

      <div v-else class="cards">
        <article v-for="row in trackedOrders" :key="row.orderId" class="track-card">
          <div class="track-head">
            <strong>Don: {{ row.orderId }}</strong>
            <span :class="['badge', row.delivery ? row.delivery.status : (row.orderStatus || 'pending')]">
              {{ row.delivery ? row.delivery.status : (row.orderStatus || 'not_assigned') }}
            </span>
          </div>

          <p class="muted">Trang thai don hang: <strong>{{ row.orderStatus || 'pending' }}</strong></p>
          <p class="eta">ETA du kien: {{ getEta(row) }}</p>

          <template v-if="row.delivery">
            <p class="address">Dia chi: {{ row.delivery.deliveryAddress || 'N/A' }}</p>
            <p class="driver-name">
              Tai xe:
              <strong>
                {{ row.delivery.driverId ? row.delivery.driverId.name : 'Chua co tai xe' }}
              </strong>
            </p>
            <p class="muted" v-if="row.delivery.driverId">
              SDT: {{ row.delivery.driverId.phone }} | Vi tri: {{ row.delivery.driverId.currentLocation || 'N/A' }}
            </p>
          </template>

          <p v-else class="muted">Don nay dang cho tai xe. He thong se thu gan lai tu dong.</p>

          <ul class="noti-list" v-if="row.notifications.length > 0">
            <li v-for="n in row.notifications.slice(0, 2)" :key="n._id">
              {{ n.message }}
            </li>
          </ul>
        </article>
      </div>
    </div>

    <div class="panel driver-panel">
      <h2>Thong tin tai xe</h2>
      <p class="hint">Trang thai tai xe trong he thong giao hang.</p>

      <div v-if="drivers.length === 0" class="empty">Chua co du lieu tai xe.</div>

      <ul v-else class="driver-list">
        <li v-for="d in drivers" :key="d._id" class="driver-item">
          <div>
            <strong>{{ d.name }}</strong>
            <p>{{ d.phone }}</p>
          </div>
          <span :class="['badge', d.status]">{{ d.status }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import API from "../api";

export default {
  data() {
    return {
      loading: true,
      trackedOrders: [],
      drivers: [],
    };
  },
  methods: {
    async fetchTrackingData() {
      this.loading = true;
      const email = localStorage.getItem("email");

      if (!email) {
        this.trackedOrders = [];
        this.drivers = [];
        this.loading = false;
        return;
      }

      try {
        const [ordersRes, driversRes] = await Promise.all([
          API.order.get(`/user/${email}`),
          API.delivery.get("/drivers"),
        ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        this.drivers = Array.isArray(driversRes.data) ? driversRes.data : [];

        const deliveryResults = await Promise.allSettled(
          orders.map((o) => API.delivery.get(`/order/${o._id}`))
        );

        const notificationResults = await Promise.allSettled(
          orders.map((o) => API.notification.get(`/order/${o._id}`))
        );

        this.trackedOrders = orders.map((order, idx) => {
          const deliveryValue = deliveryResults[idx];
          const notiValue = notificationResults[idx];

          return {
            orderId: order._id,
            orderStatus: order.status || "pending",
            delivery:
              deliveryValue.status === "fulfilled" ? deliveryValue.value.data : null,
            notifications:
              notiValue.status === "fulfilled" && Array.isArray(notiValue.value.data)
                ? notiValue.value.data
                : [],
          };
        });
      } catch (err) {
        console.error("Cannot fetch delivery tracking data:", err);
        this.trackedOrders = [];
      } finally {
        this.loading = false;
      }
    },
    getEta(row) {
      const status = row.delivery ? row.delivery.status : row.orderStatus;

      if (!status || ["pending", "confirmed", "preparing"].includes(status)) {
        return "25-35 phut";
      }

      if (["ready", "waiting_for_driver", "searching_driver", "assigned"].includes(status)) {
        return "15-25 phut";
      }

      if (["accepted", "picked_up", "on_the_way", "delivering"].includes(status)) {
        return "5-15 phut";
      }

      if (["delivered", "completed"].includes(status)) {
        return "Da giao";
      }

      if (status === "cancelled") {
        return "Da huy";
      }

      return "Dang cap nhat";
    },
  },
  mounted() {
    this.fetchTrackingData();
    window.addEventListener("order-updated", this.fetchTrackingData);
  },
  beforeUnmount() {
    window.removeEventListener("order-updated", this.fetchTrackingData);
  },
};
</script>

<style scoped>
.tracking-wrap {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 12px;
}

.panel {
  background: #ffffff;
  border: 1px solid rgba(23, 33, 47, 0.1);
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.11);
  padding: 18px;
  text-align: left;
}

h2 {
  font-size: 1.3rem;
  color: #12253a;
}

.hint {
  margin-top: 6px;
  color: #61738a;
  font-size: 0.93rem;
}

.cards {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.track-card {
  border: 1px solid #d7e5f2;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px;
}

.track-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.address,
.driver-name,
.muted {
  margin-top: 6px;
}

.eta {
  margin-top: 6px;
  color: #0f5f77;
  font-weight: 700;
}

.muted {
  color: #66758a;
  font-size: 0.92rem;
}

.noti-list {
  margin: 8px 0 0;
  padding-left: 18px;
  color: #314154;
}

.driver-list {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.driver-item {
  border: 1px solid #d7e5f2;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.driver-item p {
  color: #66758a;
  font-size: 0.9rem;
  margin-top: 2px;
}

.badge {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 4px 8px;
  background: #dbeafe;
  color: #1e3a8a;
}

.badge.assigned,
.badge.searching_driver,
.badge.accepted,
.badge.picked_up,
.badge.on_the_way {
  background: #e0f2fe;
  color: #0c4a6e;
}

.badge.delivered,
.badge.available {
  background: #dcfce7;
  color: #166534;
}

.badge.cancelled,
.badge.busy {
  background: #fee2e2;
  color: #991b1b;
}

.badge.offline,
.badge.waiting_for_driver,
.badge.pending {
  background: #e5e7eb;
  color: #374151;
}

.empty {
  margin-top: 12px;
  color: #66758a;
}

@media (max-width: 900px) {
  .tracking-wrap {
    grid-template-columns: 1fr;
  }
}
</style>
