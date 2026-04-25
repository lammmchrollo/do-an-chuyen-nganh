<template>
  <div class="dashboard">
    <p>
      👋 Welcome, <strong>{{ userEmail }}</strong>
      <button @click="logout">Log out</button>
    </p>
    <ProductList />
    <OrderForm />
    <OrderHistory />
  </div>
</template>

<script>
import ProductList from "./ProductList.vue";
import OrderForm from "./OrderForm.vue";
import OrderHistory from "./OrderHistory.vue";

export default {
  components: { ProductList, OrderForm, OrderHistory },
  data() {
    return { userEmail: "" };
  },
  mounted() {
    this.userEmail = localStorage.getItem("email") || "";
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push("/");
    },
  },
};
</script>
