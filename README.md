# 🍞 Hệ Thống Quản Lý Bán Bánh (Bakery Management System)

Ứng dụng web quản lý cửa hàng bán bánh: bán hàng, quản lý kho, nhập hàng, nhân viên và báo cáo. Hệ thống được xây dựng theo **kiến trúc modular** giúp dễ mở rộng, bảo trì và phát triển độc lập từng nghiệp vụ.

---

## 📋 Mục Lục

- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Kiến Trúc Tổng Quan](#-kiến-trúc-tổng-quan)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [Các Module Nghiệp Vụ](#-các-module-nghiệp-vụ)
- [Thiết Kế Cơ Sở Dữ Liệu](#-thiết-kế-cơ-sở-dữ-liệu)
- [Cài Đặt & Chạy Dự Án](#-cài-đặt--chạy-dự-án)
- [Quy Ước Phát Triển](#-quy-ước-phát-triển)
- [Lộ Trình Phát Triển](#-lộ-trình-phát-triển)

---

## 🛠 Công Nghệ Sử Dụng

| Thành phần | Công nghệ | Ghi chú |
|-----------|-----------|---------|
| **Frontend** | React 18 + Vite | UI người dùng, SPA |
| **State Management** | Redux Toolkit / TanStack Query | Quản lý state & server cache |
| **UI Library** | Ant Design / Material UI | Component dựng sẵn cho dashboard |
| **Backend** | Node.js + Express | REST API |
| **Database** | PostgreSQL 15+ | CSDL quan hệ |
| **ORM** | Prisma / Sequelize | Truy vấn & migration |
| **Auth** | JWT + bcrypt | Xác thực & phân quyền |
| **Validation** | Zod / Joi | Kiểm tra dữ liệu đầu vào |
| **Logging** | Winston / Pino | Ghi log hệ thống |
| **API Docs** | Swagger (OpenAPI) | Tài liệu API tự động |
| **Container** | Docker + Docker Compose | Đóng gói & triển khai |

---

## 🏗 Kiến Trúc Tổng Quan

Hệ thống chia thành 3 tầng rõ ràng, mỗi tầng giao tiếp qua interface chuẩn:

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND (React)               │
│   Pages → Components → Services (API client)     │
└───────────────────────┬─────────────────────────┘
                        │ HTTP / REST (JSON)
┌───────────────────────┴─────────────────────────┐
│                BACKEND (Node + Express)          │
│   Routes → Controllers → Services → Repositories │
│              (mỗi module độc lập)                 │
└───────────────────────┬─────────────────────────┘
                        │ SQL (ORM)
┌───────────────────────┴─────────────────────────┐
│                  DATABASE (PostgreSQL)           │
└─────────────────────────────────────────────────┘
```

### Nguyên tắc kiến trúc Modular

Mỗi module là một "khối nghiệp vụ" khép kín, tự chứa đầy đủ các tầng:

```
module/
├── module.routes.js        # Định nghĩa endpoint
├── module.controller.js    # Nhận request, trả response
├── module.service.js       # Logic nghiệp vụ
├── module.repository.js    # Truy vấn database
├── module.validation.js    # Schema kiểm tra dữ liệu
└── module.model.js         # Định nghĩa model / type
```

**Lợi ích:**
- ✅ Mỗi nghiệp vụ phát triển & test độc lập
- ✅ Dễ thêm/bớt module mà không ảnh hưởng phần còn lại
- ✅ Phân chia công việc rõ ràng giữa các thành viên
- ✅ Tách biệt logic — controller mỏng, service chứa nghiệp vụ, repository chứa SQL

---

## 📁 Cấu Trúc Thư Mục

```
App-banbanh/
│
├── backend/
│   ├── src/
│   │   ├── modules/                 # 🔑 Các module nghiệp vụ
│   │   │   ├── auth/                # Đăng nhập, phân quyền
│   │   │   ├── sales/               # Bán hàng (POS, hóa đơn)
│   │   │   ├── inventory/           # Quản lý kho
│   │   │   ├── purchasing/          # Nhập hàng
│   │   │   ├── products/            # Sản phẩm bánh
│   │   │   ├── employees/           # Nhân viên
│   │   │   ├── customers/           # Khách hàng
│   │   │   ├── suppliers/           # Nhà cung cấp
│   │   │   └── reports/             # Báo cáo & thống kê
│   │   │
│   │   ├── common/                  # Code dùng chung
│   │   │   ├── middlewares/         # auth, error handler, logger
│   │   │   ├── utils/               # helper functions
│   │   │   ├── constants/           # hằng số, enum
│   │   │   └── errors/              # custom error classes
│   │   │
│   │   ├── config/                  # Cấu hình (db, env, swagger)
│   │   ├── database/                # Migrations & seeds
│   │   ├── app.js                   # Khởi tạo Express app
│   │   └── server.js                # Entry point
│   │
│   ├── tests/                       # Unit & integration tests
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── modules/                 # Tổ chức theo module tương ứng
│   │   │   ├── sales/
│   │   │   ├── inventory/
│   │   │   ├── purchasing/
│   │   │   ├── employees/
│   │   │   └── reports/
│   │   ├── components/              # Component tái sử dụng
│   │   ├── layouts/                 # Layout chung (sidebar, header)
│   │   ├── services/                # API client (axios)
│   │   ├── hooks/                   # Custom hooks
│   │   ├── store/                   # State management
│   │   ├── routes/                  # Định nghĩa route
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 🧩 Các Module Nghiệp Vụ

### 1. 🔐 Auth (Xác thực & Phân quyền)
- Đăng nhập / đăng xuất bằng JWT
- Phân quyền theo vai trò: `ADMIN`, `MANAGER`, `CASHIER` (thu ngân), `STAFF`
- Đổi mật khẩu, quản lý phiên đăng nhập

### 2. 🛒 Sales (Bán hàng)
- Màn hình bán hàng (POS) — chọn bánh, tạo đơn nhanh
- Tạo hóa đơn, tính tiền, áp dụng giảm giá
- Lịch sử giao dịch, in hóa đơn
- **Tự động trừ tồn kho** khi bán thành công

### 3. 📦 Inventory (Quản lý kho)
- Theo dõi tồn kho theo từng sản phẩm
- Cảnh báo hết hàng / sắp hết (ngưỡng tồn tối thiểu)
- Lịch sử xuất – nhập kho (stock movements)
- Kiểm kê, điều chỉnh tồn kho

### 4. 📥 Purchasing (Nhập hàng)
- Tạo phiếu nhập hàng từ nhà cung cấp
- **Tự động cộng tồn kho** khi nhập hàng
- Theo dõi công nợ nhà cung cấp
- Lịch sử nhập hàng

### 5. 🎂 Products (Sản phẩm)
- Quản lý danh mục bánh (loại, giá bán, giá vốn, hình ảnh)
- Quản lý category (bánh kem, bánh mì, bánh ngọt...)
- Bật/tắt sản phẩm đang kinh doanh

### 6. 👥 Employees (Nhân viên)
- Hồ sơ nhân viên (thông tin, chức vụ, lương)
- Phân ca làm việc
- Liên kết với tài khoản đăng nhập

### 7. 🧑‍🤝‍🧑 Customers (Khách hàng)
- Quản lý thông tin khách hàng
- Tích điểm / chương trình thành viên (tùy chọn)

### 8. 🏭 Suppliers (Nhà cung cấp)
- Quản lý thông tin nhà cung cấp
- Liên kết với phiếu nhập hàng

### 9. 📊 Reports (Báo cáo)
- Báo cáo doanh thu theo ngày/tháng/năm
- Báo cáo lợi nhuận (doanh thu − giá vốn)
- Top sản phẩm bán chạy
- Báo cáo tồn kho, công nợ

---

## 🗄 Thiết Kế Cơ Sở Dữ Liệu

Sơ đồ quan hệ chính giữa các bảng:

```
users ──< employees                 suppliers ──< purchase_orders ──< purchase_order_items
                                                                              │
categories ──< products ──┬─────────────────────────────────────────────────┘
                          │
                          ├──< stock_movements        (lịch sử xuất/nhập kho)
                          │
                          └──< order_items >── orders >── customers
```

### Các bảng chính

| Bảng | Mô tả |
|------|-------|
| `users` | Tài khoản đăng nhập, vai trò |
| `employees` | Hồ sơ nhân viên |
| `categories` | Danh mục sản phẩm |
| `products` | Sản phẩm bánh (giá bán, giá vốn, tồn kho) |
| `customers` | Khách hàng |
| `suppliers` | Nhà cung cấp |
| `orders` | Hóa đơn bán hàng |
| `order_items` | Chi tiết hóa đơn |
| `purchase_orders` | Phiếu nhập hàng |
| `purchase_order_items` | Chi tiết phiếu nhập |
| `stock_movements` | Lịch sử biến động tồn kho |

> Chi tiết schema đầy đủ sẽ được định nghĩa trong `backend/src/database/migrations/`.

---

## 🚀 Cài Đặt & Chạy Dự Án

### Yêu cầu
- Node.js >= 18
- PostgreSQL >= 15
- Docker (tùy chọn, khuyến nghị)

### Cách 1: Chạy với Docker (khuyến nghị)

```bash
# Clone dự án
git clone <repo-url>
cd App-banbanh

# Tạo file môi trường
cp backend/.env.example backend/.env

# Khởi chạy toàn bộ (db + backend + frontend)
docker-compose up -d
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs (Swagger): http://localhost:3000/api-docs

### Cách 2: Chạy thủ công

```bash
# --- Backend ---
cd backend
npm install
cp .env.example .env          # cấu hình kết nối PostgreSQL
npm run migrate               # chạy migration tạo bảng
npm run seed                  # (tùy chọn) dữ liệu mẫu
npm run dev                   # chạy server dev

# --- Frontend ---
cd ../frontend
npm install
npm run dev
```

### Biến môi trường (`backend/.env`)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/banbanh

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

---

## 📐 Quy Ước Phát Triển

### Đặt tên
- **File:** `kebab-case` hoặc `module.layer.js` (vd: `sales.service.js`)
- **Biến/hàm:** `camelCase`
- **Class/Component:** `PascalCase`
- **Bảng DB:** `snake_case`, số nhiều (vd: `order_items`)
- **Hằng số:** `UPPER_SNAKE_CASE`

### Quy ước API
- RESTful, theo dạng `/api/v1/<resource>`
- Phương thức: `GET` (đọc), `POST` (tạo), `PUT/PATCH` (cập nhật), `DELETE` (xóa)
- Response chuẩn:

```json
{
  "success": true,
  "data": { },
  "message": "Thao tác thành công"
}
```

### Git
- Branch: `feature/<module>-<mô-tả>`, `fix/<mô-tả>`
- Commit theo [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `docs:`...

---

## 🗺 Lộ Trình Phát Triển

- [ ] **Giai đoạn 1 — Nền tảng:** Setup dự án, kết nối DB, module Auth
- [ ] **Giai đoạn 2 — Sản phẩm & Kho:** Module Products, Inventory
- [ ] **Giai đoạn 3 — Nhập hàng:** Module Suppliers, Purchasing
- [ ] **Giai đoạn 4 — Bán hàng:** Module Sales (POS), Customers
- [ ] **Giai đoạn 5 — Nhân sự & Báo cáo:** Module Employees, Reports
- [ ] **Giai đoạn 6 — Hoàn thiện:** Testing, Docker, triển khai

---

## 📄 License

MIT
