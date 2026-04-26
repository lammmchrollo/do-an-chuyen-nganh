# Hệ thống Microservices Giao Đồ Ăn (Food Delivery Platform)

Dự án này điều chỉnh kiến trúc mẫu từ Online Service Marketplace sang nghiệp vụ Giao đồ ăn (Food Delivery), đồng thời triển khai hoàn toàn trên nền tảng Microservices, hỗ trợ Docker, Kubernetes và CI/CD với Jenkins.

## 1. Phạm vi công việc của nhóm

- **DevOps (Khánh)**: Docker, Kubernetes, Jenkins, cấu hình MongoDB, API Gateway (Nginx).
- **Frontend (Kiên)**: Giao diện người dùng (Vue.js), tích hợp API, cập nhật thời gian thực (Real-time tracking).
- **Backend User + Restaurant (Hưng)**: Quản lý Authentication/Authorization, tài khoản, nhà hàng và menu.
- **Backend Order + Payment (Q.Khánh)**: Vòng đời đơn hàng, mô phỏng chức năng thanh toán.
- **Backend Delivery + Notification (Lâm)**: Quản lý tài xế, theo dõi tiến độ giao hàng, gửi thông báo qua Socket.io.

## 2. Kiến trúc & Bản đồ Service

Luồng xử lý Request mặc định:
`Frontend -> API Gateway (Nginx) -> Từng Service đích -> MongoDB`

Luồng xử lý Real-time:
`Cập nhật trạng thái đơn hàng (Order/Delivery Service) -> Notification Service -> Broadcast Socket.io -> Frontend`

### Danh sách các Microservices:
- **`user-service`** (`4001`): Quản lý tài khoản và phân quyền.
- **`restaurant-service`** (`4002`): Quản lý quán ăn và thực đơn.
- **`order-service`** (`4003`): Quản lý vòng đời đặt món của người dùng.
- **`payment-service`** (`4004`): Xử lý mô phỏng thanh toán đơn hàng.
- **`delivery-service`** (`4005`): Gán tài xế, quản lý toạ độ và trạng thái giao hàng.
- **`notification-service`** (`4006`): Lưu lịch sử thông báo và đẩy tin nhắn realtime qua Socket.io.
- **`gateway`** (`80`): Cổng dẫn duy nhất ra bên ngoài (Reverse Proxy).
- **`frontend`** (`80`): Giao diện người dùng.

> **Cơ sở dữ liệu:** Hệ thống dùng chung **MongoDB** (Port `27017` trên local). Các cấu hình service đã được chuẩn hóa tên miền theo `restaurant-service`.

## 3. Cổng API (API Gateway)

Gateway có nhiệm vụ phân luồng request cho các service tương ứng bằng prefix:

- `/api/users/*` ➔ `user-service:4001`
- `/api/restaurants/*` ➔ `restaurant-service:4002`
- `/api/orders/*` ➔ `order-service:4003`
- `/api/payments/*` ➔ `payment-service:4004`
- `/api/deliveries/*` ➔ `delivery-service:4005`
- `/api/notifications/*` ➔ `notification-service:4006`
- `/socket.io/*` ➔ `notification-service:4006` (Hỗ trợ nâng cấp kết nối WebSocket)

## 4. Chi tiết API Delivery & Notification

### Delivery Service
- `GET /api/deliveries/drivers`: Lấy danh sách tài xế
- `POST /api/deliveries/drivers`: Đăng ký tài xế mới
- `PATCH /api/deliveries/drivers/:id/status`: Cập nhật trạng thái tài xế (Available/Busy)
- `GET /api/deliveries`: Xem danh sách tất cả các cuốc giao
- `POST /api/deliveries/assign`: Điều phối/Gán tài xế cho đơn hàng
- `GET /api/deliveries/order/:orderId`: Xem thông tin giao đồ ăn của đơn
- `PATCH /api/deliveries/:id/status`: Cập nhật lộ trình (Pickup, In transit, Delivered)

### Notification Service
- `POST /api/notifications`: Tạo một thông báo mới
- `GET /api/notifications`: Xem tất cả thông báo
- `GET /api/notifications/order/:orderId`: Các thông báo thuộc về 1 đơn hàng cụ thể
- `PATCH /api/notifications/:id/read`: Đánh dấu là đã đọc

**Sự kiện Socket.io (WebSocket):**
- Event `order-status-changed`: Bắn về cho Client khi đơn hàng chuyển các trạng thái chờ nấu, đang giao, đã giao.

## 5. Hướng dẫn chạy môi trường Local (Docker Compose)

Khởi động tất cả các dịch vụ:
```bash
docker compose up -d --build
```
Kiểm tra trạng thái các container:
```bash
docker compose ps
```
Gọi API thử nghiệm:
```bash
curl http://localhost/api/deliveries/drivers
curl http://localhost/api/notifications
```
Dừng hệ thống: `docker compose down`

## 6. Hướng dẫn triển khai lên Kubernetes (K8s)

Hệ thống cung cấp sẵn các file manifests để chạy trong cụm K8s tại thư mục `/k8s`.
Thứ tự apply:

1. **Khởi tạo Namespace**:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   ```
2. **Deploy MongoDB**:
   ```bash
   kubectl apply -f k8s/mongo.yaml
   ```
3. **Deploy Backend Services**:
   ```bash
   kubectl apply -f k8s/user.yaml
   kubectl apply -f k8s/restaurant.yaml
   kubectl apply -f k8s/order.yaml
   kubectl apply -f k8s/payment.yaml
   ```
   *(Thêm các file yaml ứng với `delivery` và `notification` nếu có)*
   
4. **Deploy Frontend & Nginx Gateway**:
   ```bash
   kubectl apply -f k8s/frontend.yaml
   kubectl apply -f k8s/nginx.yaml
   ```
   
Kiểm tra pod:
```bash
kubectl get pods -n <food-delivery-namespace>
```

## 7. Quy trình CI/CD với Jenkins

Hệ thống có cấu hình pipeline Jenkins ở `Jenkinsfile` và `script.groovy`.
Khi code được đẩy lên nhánh chính (Main/Master), Jenkins sẽ tự động thực hiện:

1. **Checkout Code**: Lấy file mới nhất từ Git.
2. **Build and Push Docker Images**: 
   - Build image cho tất cả backend/frontend.
   - Tag theo bản update `latest` và đẩy lên Docker Hub (`nguyenducmanh247/*`).
3. **Deploy to Kubernetes**:
   - Chạy lệnh kubectl apply -f thư mục `k8s/` để nâng cấp cụm.
4. **Verify Deployment**: Kiểm tra và đảm bảo các Rollout trạng thái là *healthy*.
