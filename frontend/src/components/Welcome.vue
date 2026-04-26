<template>
  <div class="welcome fade-up">
    <div class="hero-card">
      <span class="eyebrow">Food Delivery Microservices</span>
      <h1>Nen tang dat dich vu va giao hang thong minh</h1>
      <p>
        Trai nghiem luong dat don, thanh toan va theo doi giao hang theo thoi gian
        thuc trong mot giao dien don gian, ro rang.
      </p>
      <div class="actions">
        <router-link to="/register" class="btn primary">Tao tai khoan</router-link>
        <router-link to="/login" class="btn ghost">Dang nhap</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  min-height: calc(100vh - 80px);
  display: grid;
  place-items: center;
}

.hero-card {
  width: min(820px, 100%);
  background: linear-gradient(150deg, #ffffff 0%, #eef8ff 45%, #fff3dd 100%);
  border: 1px solid rgba(23, 33, 47, 0.08);
  border-radius: 24px;
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.14);
  padding: 34px 30px;
  text-align: left;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #e1f2f7;
  color: #0f5f77;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1 {
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.15;
  color: #102437;
}

p {
  margin-top: 12px;
  max-width: 680px;
  color: #475569;
}

.actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.primary {
  background: linear-gradient(135deg, #0e7490, #155e75);
  color: #fff;
  box-shadow: 0 12px 24px rgba(14, 116, 144, 0.35);
}

.ghost {
  background: #ffffff;
  color: #1f2937;
  border: 1px solid rgba(31, 41, 55, 0.2);
}

@media (max-width: 640px) {
  .hero-card {
    padding: 24px 18px;
    border-radius: 18px;
  }
}
</style>
