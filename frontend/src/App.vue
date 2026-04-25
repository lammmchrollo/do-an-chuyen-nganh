<template>
  <router-view />
</template>

<script>
export default {
  name: "App",
};
</script>

<style scoped>
.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
  text-align: center;
}
.logout-btn {
  margin-left: 10px;
  padding: 5px 12px;
  background: #c0392b;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.logout-btn:hover {
  background: #992d22;
}
</style>
