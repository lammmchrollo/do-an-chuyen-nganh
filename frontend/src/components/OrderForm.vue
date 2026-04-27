<template>
  <div class="order-form fade-up">
    <h2>Gio hang</h2>

    <div v-if="cart.length === 0" class="empty">Gio hang dang trong.</div>

    <ul v-else class="cart-list">
      <li v-for="item in cart" :key="item.productId" class="cart-item">
        <div>
          <strong>{{ item.productName }}</strong>
          <p>{{ item.unitPrice }} đ x {{ item.quantity }}</p>
        </div>
        <div class="qty-actions">
          <button @click="changeQty(item.productId, -1)">-</button>
          <span>{{ item.quantity }}</span>
          <button @click="changeQty(item.productId, 1)">+</button>
        </div>
      </li>
    </ul>

    <input
      v-model="deliveryAddress"
      placeholder="Dia chi giao hang (VD: 123 Nguyen Trai, Quan 5)"
      class="input"
    />
    <select v-model="paymentMethod" class="input">
      <option value="cash">Tien mat</option>
      <option value="card">The</option>
      <option value="wallet">Vi dien tu</option>
    </select>

    <div v-if="cart.length > 0" class="info">
      <strong>Tam tinh:</strong> {{ subtotal }} đ <br />
      <strong>Phi giao hang:</strong> {{ deliveryFee }} đ <br />
      <strong>Tong tien:</strong> <span class="price">{{ totalPrice }} đ</span>
    </div>

    <button @click="submitOrder" class="button" :disabled="cart.length === 0">
      Dat hang va thanh toan
    </button>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
  </div>
</template>

<script>
import API from "../api";

export default {
  data() {
    return {
      cart: [],
      deliveryAddress: "",
      paymentMethod: "cash",
      deliveryFee: 15000,
      errorMsg: "",
    };
  },
  computed: {
    subtotal() {
      return this.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    },
    totalPrice() {
      return this.subtotal + this.deliveryFee;
    },
  },
  methods: {
    loadCart() {
      this.cart = JSON.parse(localStorage.getItem("cart") || "[]");
    },
    changeQty(productId, delta) {
      const found = this.cart.find((item) => item.productId === productId);
      if (!found) return;

      found.quantity += delta;
      if (found.quantity <= 0) {
        this.cart = this.cart.filter((item) => item.productId !== productId);
      }

      localStorage.setItem("cart", JSON.stringify(this.cart));
      window.dispatchEvent(new Event("cart-updated"));
    },
    async submitOrder() {
      this.errorMsg = "";

      const email = localStorage.getItem("email");
      if (!email) {
        this.errorMsg = "❌ You are not logged in!";
        return;
      }

      if (this.cart.length === 0) {
        this.errorMsg = "❌ Gio hang dang trong";
        return;
      }

      if (!this.deliveryAddress.trim()) {
        this.errorMsg = "❌ Vui long nhap dia chi giao hang!";
        return;
      }

      try {
        const orderRes = await API.order.post("/", {
          userEmail: email,
          items: this.cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          deliveryFee: this.deliveryFee,
          deliveryAddress: this.deliveryAddress,
        });
        alert("✅ Order created successfully! Order ID: " + orderRes.data._id);

        await API.payment.post("/", {
          orderId: orderRes.data._id,
          amount: this.totalPrice,
          method: this.paymentMethod,
        });
        alert("✅ Payment successful!");

        localStorage.removeItem("cart");
        this.cart = [];
        this.deliveryAddress = "";
        window.dispatchEvent(new Event("order-updated"));
        window.dispatchEvent(new Event("cart-updated"));
      } catch (err) {
        console.error("❌ Error creating order:", err);
        this.errorMsg = err.response?.data?.error || "Order creation failed!";
      }
    },
  },
  mounted() {
    this.loadCart();
    window.addEventListener("cart-updated", this.loadCart);
  },
  beforeUnmount() {
    window.removeEventListener("cart-updated", this.loadCart);
  },
};
</script>

<style scoped>
.order-form {
  max-width: 520px;
  margin: 16px auto;
  background: #ffffff;
  border: 1px solid rgba(23, 33, 47, 0.1);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.11);
  padding: 20px;
  border-radius: 14px;
  text-align: left;
}

.cart-list {
  list-style: none;
  padding: 0;
  margin: 8px 0;
  display: grid;
  gap: 8px;
}

.cart-item {
  border: 1px solid #d7e5f2;
  border-radius: 10px;
  padding: 10px;
  background: #f8fbff;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.cart-item p {
  margin-top: 2px;
  color: #5f6f85;
  font-size: 0.9rem;
}

.qty-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-actions button {
  border: 1px solid #cad8e4;
  background: #ffffff;
  border-radius: 8px;
  width: 28px;
  height: 28px;
  cursor: pointer;
}

h2 {
  font-size: 1.45rem;
  color: #12253a;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  background: #f8fbff;
  color: #1f2937;
  border: 1px solid #cad8e4;
  border-radius: 10px;
}

.input:focus {
  outline: none;
  border-color: #0e7490;
  box-shadow: 0 0 0 4px rgba(14, 116, 144, 0.17);
}

.button {
  width: 100%;
  padding: 11px;
  background: linear-gradient(135deg, #14b26a, #0d9a5a);
  color: white;
  border: none;
  border-radius: 10px;
  margin-top: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.error {
  color: #dc2626;
  margin-top: 10px;
}

.info {
  background: #f4f9ff;
  border: 1px solid #d4e5f3;
  color: #314154;
  padding: 10px;
  border-radius: 10px;
  margin-top: 10px;
  line-height: 1.6;
}

.price {
  color: #0f9d5d;
}

.empty {
  color: #5f6f85;
  margin: 6px 0 10px;
}
</style>
