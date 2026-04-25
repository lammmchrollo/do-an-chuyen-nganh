# Hệ thống Microservices Giao Đồ Ăn (dựa trên Online Service Marketplace)

Dự án này điều chỉnh kiến trúc mẫu Online Service Marketplace sang nghiệp vụ Giao đồ ăn, đồng thời vẫn giữ mô hình microservices.

## 1. Phạm vi công việc của nhóm

- DevOps (Khánh): Docker, Kubernetes, Jenkins, MongoDB, API Gateway Nginx
- Frontend (Kiên): giao diện Vue, tích hợp API, cập nhật thời gian thực
- Backend User + Restaurant (Hưng): xác thực, phân quyền, nhà hàng, menu
- Backend Order + Payment (Q.Khánh): vòng đời đơn hàng, mô phỏng thanh toán
- Backend Delivery + Notification (Lâm): tài xế, theo dõi giao hàng, thông báo Socket.io

## 2. Bản đồ service hiện tại

- user-service -> tài khoản người dùng và phân quyền
- restaurant-service -> nhà hàng/menu
- order-service -> đơn đặt món
- payment-service -> mô phỏng thanh toán
- delivery-service -> gán tài xế và tiến độ giao hàng
- notification-service -> lưu và đẩy thông báo thời gian thực
- gateway -> cổng API duy nhất
- frontend -> giao diện khách hàng/nhà hàng

## 3. Kiến trúc

Luồng request:

Frontend -> Gateway -> Service đích -> MongoDB

Luồng realtime:

Cập nhật trạng thái đơn/giao hàng -> Notification Service -> Socket.io -> Frontend

## 4. Cổng dịch vụ

- Gateway: 80
- Frontend container: 80 (publish ra 5173 trong compose)
- User Service: 4001
- Restaurant Service: 4002
- Order Service: 4003
- Payment Service: 4004
- Delivery Service: 4005
- Notification Service: 4006
- MongoDB: 27017

## 5. API Delivery + Notification

Delivery Service:

- GET `/api/deliveries/drivers`
- POST `/api/deliveries/drivers`
- PATCH `/api/deliveries/drivers/:id/status`
- POST `/api/deliveries/assign`
- GET `/api/deliveries`
- GET `/api/deliveries/order/:orderId`
- PATCH `/api/deliveries/:id/status`

Notification Service:

- POST `/api/notifications`
- GET `/api/notifications`
- GET `/api/notifications/order/:orderId`
- PATCH `/api/notifications/:id/read`

Sự kiện Socket.io:

- `order-status-changed`

## 6. Route Gateway

Gateway proxy các đường dẫn:

- `/api/users` -> user-service
- `/api/restaurants` -> restaurant-service
- `/api/orders` -> order-service
- `/api/payments` -> payment-service
- `/api/deliveries` -> delivery-service
- `/api/notifications` -> notification-service
- `/socket.io` -> notification-service (nâng cấp kết nối websocket)

## 7. Chạy bằng Docker Compose

```bash
docker compose up --build
```

Lệnh kiểm tra nhanh:

```bash
docker ps
curl http://localhost/api/deliveries/drivers
curl http://localhost/api/notifications
```

## 8. Tính nhất quán tên service

- Tên service đã được đồng bộ theo domain giao đồ ăn với `restaurant-service`.
