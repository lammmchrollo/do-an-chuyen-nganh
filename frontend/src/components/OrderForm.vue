<template>
  <div class="order-form fade-up">
    <h2>Tao don hang</h2>

    <select v-model="selectedProductId" @change="updateSelectedProduct" class="input">
      <option disabled value="">-- Chon mon an --</option>
      <option v-for="p in products" :key="p._id" :value="p._id">
        {{ p.name }} ({{ p.price }} đ)
      </option>
    </select>

    <input type="number" v-model.number="quantity" placeholder="So luong" min="1" class="input" />
    <input
      v-model="deliveryAddress"
      placeholder="Dia chi giao hang (VD: 123 Nguyen Trai, Quan 5)"
      class="input"
    />

    <div v-if="selectedProduct" class="info">
      <strong>Mo ta:</strong> {{ selectedProduct.description }} <br />
      <strong>Don gia:</strong> {{ selectedProduct.price }} đ <br />
      <strong>Tong tien:</strong> <span class="price">{{ totalPrice }} đ</span>
    </div>

    <button @click="submitOrder" class="button">Tao don</button>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
  </div>
</template>

<script>
import API from "../api";

export default {
  data() {
    return {
      quantity: 1,
      selectedProductId: "",
      selectedProduct: null,
      products: [],
      deliveryAddress: "",
      errorMsg: "",
    };
  },
  computed: {
    totalPrice() {
      return this.selectedProduct ? this.selectedProduct.price * this.quantity : 0;
    },
  },
  methods: {
    updateSelectedProduct() {
      this.selectedProduct = this.products.find((p) => p._id === this.selectedProductId);
    },
    async submitOrder() {
      this.errorMsg = "";

      const email = localStorage.getItem("email");
      if (!email) {
        this.errorMsg = "❌ You are not logged in!";
        return;
      }

      if (!this.selectedProduct) {
        this.errorMsg = "❌ Please select a service!";
        return;
      }
      if (this.quantity < 1) {
        this.errorMsg = "❌ Quantity must be greater than 0!";
        return;
      }

      if (!this.deliveryAddress.trim()) {
        this.errorMsg = "❌ Vui long nhap dia chi giao hang!";
        return;
      }

      try {
        const orderRes = await API.order.post("/", {
          userEmail: email,
          productId: this.selectedProductId,
          quantity: this.quantity,
          totalPrice: this.totalPrice,
          deliveryAddress: this.deliveryAddress,
        });
        alert("✅ Order created successfully! Order ID: " + orderRes.data._id);

        await API.payment.post("/", {
          orderId: orderRes.data._id,
          amount: this.totalPrice,
        });
        alert("✅ Payment successful!");

        // Reset form
        this.selectedProductId = "";
        this.selectedProduct = null;
        this.quantity = 1;
        this.deliveryAddress = "";
        window.dispatchEvent(new Event("order-updated"));
      } catch (err) {
        console.error("❌ Error creating order:", err);
        this.errorMsg = err.response?.data?.error || "Order creation failed!";
      }
    },
  },
  async mounted() {
    try {
      const res = await API.restaurant.get("/");
      this.products = res.data;
    } catch (err) {
      console.error("❌ Error loading service list:", err);
    }
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
</style>
