# He thong Microservices Giao Do An

Du an xay dung nen tang dat do an theo kien truc microservices, co day du luong nghiep vu:

- Khach hang: tim nha hang, chon mon, gio hang, dat don, theo doi trang thai don.
- Nha hang: quan ly menu, nhan/tu choi don, cap nhat tien do xu ly don.
- Van chuyen: gan tai xe ngau nhien trong danh sach ranh, cap nhat trang thai giao.
- Thanh toan: mo phong thanh cong/that bai va hoan tien (refund).
- Thong bao: luu lich su thong bao, day su kien qua Socket.io; frontend su dung short-polling de cap nhat UI theo thoi gian gan thuc.

## 1. Cong nghe

- Frontend: Vue 3, Vite, Vue Router, Axios.
- Backend: Node.js, Express.js.
- Auth: JWT, bcrypt.
- Database: MongoDB, Mongoose.
- Realtime/near realtime: Socket.io (backend notification) + polling tren frontend.
- Ha tang: Docker Compose, Kubernetes manifests, Jenkins pipeline.

## 2. Kien truc tong quan

Luong request chinh:

Frontend -> Gateway (Nginx) -> Backend service dich -> MongoDB

Luong cap nhat trang thai:

Order/Delivery update -> Notification service -> luu notification va emit event -> Frontend polling lay du lieu moi

## 3. Danh sach service

- user-service (4001): Dang ky, dang nhap, profile, role.
- restaurant-service (4002): CRUD nha hang, CRUD menu.
- order-service (4003): Tao don, tinh tong tien, vong doi don hang.
- payment-service (4004): Thanh toan mo phong, refund, luu lich su payment.
- delivery-service (4005): Driver status, assign driver, delivery progress.
- notification-service (4006): Tao/lay notification, Socket.io broadcast.
- frontend: ung dung Vue.
- gateway (80): API gateway ra ben ngoai.
- mongodb (27017): du lieu cho cac service.

## 4. API Gateway mapping

- /api/users/* -> user-service:4001
- /api/restaurants/* -> restaurant-service:4002
- /api/orders/* -> order-service:4003
- /api/payments/* -> payment-service:4004
- /api/deliveries/* -> delivery-service:4005
- /api/notifications/* -> notification-service:4006
- /socket.io/* -> notification-service:4006

## 5. Nghiep vu da hoan thien

### 5.1 User Service

- Dang ky user voi name, email, password, role.
- Role co ban: customer, restaurant, driver.
- Password duoc ma hoa bang bcrypt.
- Dang nhap tra JWT co thong tin role.
- Lay profile user qua endpoint xac thuc token.

API chinh:

- POST /api/users/register
- POST /api/users/login
- GET /api/users/me
- GET /api/users/check/:email

### 5.2 Restaurant Service

- Quan ly danh sach nha hang.
- Quan ly menu theo tung nha hang.
- Tim kiem nha hang/mon an theo tu khoa.
- Co trang thai mon an isAvailable de tam an/mo ban.

API chinh:

- GET /api/restaurants/restaurants
- POST /api/restaurants/restaurants
- PUT /api/restaurants/restaurants/:id
- DELETE /api/restaurants/restaurants/:id
- GET /api/restaurants/restaurants/:id/menus
- GET /api/restaurants
- POST /api/restaurants
- PUT /api/restaurants/:id
- DELETE /api/restaurants/:id

### 5.3 Order Service

- Tao don theo danh sach items.
- Tu dong tinh subtotal, deliveryFee, totalPrice.
- Kiem tra cac item trong cung 1 nha hang.
- Vong doi don hang:
  pending -> confirmed -> preparing -> ready -> delivering -> completed

Trang thai mo rong:

- waiting_for_driver
- cancelled

API chinh:

- POST /api/orders
- GET /api/orders
- GET /api/orders/:id
- GET /api/orders/user/:email
- PATCH /api/orders/:id/status
- PATCH /api/orders/:id/dispatch
- PATCH /api/orders/:id/payment-status

### 5.4 Payment Service

- Mo phong thanh toan thanh cong/that bai.
- Hoan tien cho don da thanh toan.
- Luu collection Payments trong DB rieng.
- Dong bo paymentStatus ve order-service.

API chinh:

- POST /api/payments
- POST /api/payments/refund
- GET /api/payments

### 5.5 Delivery Service

- Quan ly tai xe va trang thai tai xe (available/busy/offline).
- Gan tai xe random trong danh sach available.
- Cap nhat trang thai giao hang theo delivery id hoac theo order id.

API chinh:

- GET /api/deliveries/drivers
- POST /api/deliveries/drivers
- PATCH /api/deliveries/drivers/:id/status
- POST /api/deliveries/assign
- GET /api/deliveries
- GET /api/deliveries/order/:orderId
- PATCH /api/deliveries/:id/status
- PATCH /api/deliveries/order/:orderId/status

### 5.6 Notification Service

- Tao notification khi don doi trang thai.
- Lay notification theo order hoac toan bo.
- Socket.io emit event order-status-changed.

API chinh:

- POST /api/notifications
- GET /api/notifications
- GET /api/notifications/order/:orderId
- PATCH /api/notifications/:id/read

## 6. Frontend da trien khai

### Khach hang

- Tim nha hang/mon an.
- Them mon vao gio hang.
- Dat don va thanh toan.
- Xem lich su don hang.
- Theo doi giao hang theo polling dinh ky (khong can reload trang).

### Nha hang

- Chon/tao nha hang.
- Them, an/hien, xoa mon an.
- Nhan don, cap nhat tien do, tu choi don.
- Tu dong goi refund neu tu choi don da paid.

## 7. Chay local bang Docker Compose

Khoi dong toan bo he thong:

```bash
docker compose up -d --build
```

Kiem tra container:

```bash
docker compose ps
```

Truy cap:

- Frontend qua gateway: http://localhost
- API gateway base: http://localhost/api

Dung he thong:

```bash
docker compose down
```

## 8. Test nhanh nghiep vu

1. Dang ky customer va dang nhap.
2. Tim nha hang, them mon vao gio, dat don.
3. Kiem tra payment duoc tao va order paymentStatus = paid.
4. Dang ky/ dang nhap role restaurant, vao dashboard nha hang.
5. Nhan don -> preparing -> ready (he thong thu gan tai xe).
6. Theo doi trong man hinh tracking cua customer.
7. Thu tu choi don paid tu restaurant dashboard de kiem tra refund.

## 9. Kubernetes va Jenkins

- Thu muc k8s chua cac manifest de deploy len Kubernetes.
- Jenkinsfile va script.groovy dung cho pipeline CI/CD build image va deploy.

Luu y: Can cap nhat image tag, namespace va secret theo moi truong thuc te truoc khi deploy production.
