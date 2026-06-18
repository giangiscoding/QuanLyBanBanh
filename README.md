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

> Stack đã được nhóm chốt và áp dụng trong code.

| Thành phần | Công nghệ | Ghi chú |
|-----------|-----------|---------|
| **Frontend** | React 18 + Vite + **TypeScript** | UI người dùng, SPA |
| **UI Library** | **Ant Design** 5 | Component dựng sẵn cho dashboard |
| **State / Data** | React Context + Axios | Quản lý auth & gọi API (có thể thêm TanStack Query sau) |
| **Backend** | Node.js + Express + **TypeScript** | REST API |
| **Database** | PostgreSQL 16 | CSDL quan hệ |
| **ORM** | **Prisma** | Truy vấn & migration |
| **Auth** | JWT + bcrypt | Xác thực & phân quyền theo vai trò |
| **Validation** | Zod | Kiểm tra dữ liệu đầu vào |
| **Logging** | morgan | Ghi log HTTP (chế độ dev) |
| **Container** | Docker Compose | Chạy PostgreSQL cho môi trường dev |

> 📚 **Tài liệu liên quan:** [SETUP.md](SETUP.md) — hướng dẫn cài đặt & chạy chi tiết · [CONTRIBUTING.md](CONTRIBUTING.md) — phân công công việc & quy ước nhóm.

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
│             BACKEND (Node + Express + TS)        │
│      Routes → Controllers → Services → Prisma    │
│              (mỗi module độc lập)                 │
└───────────────────────┬─────────────────────────┘
                        │ SQL (Prisma)
┌───────────────────────┴─────────────────────────┐
│                  DATABASE (PostgreSQL)           │
└─────────────────────────────────────────────────┘
```

### Nguyên tắc kiến trúc Modular

Mỗi module là một "khối nghiệp vụ" khép kín, tự chứa đầy đủ các tầng:

```
module/
├── module.routes.ts        # Định nghĩa endpoint + middleware
├── module.controller.ts    # Nhận request, gọi service, trả response
├── module.service.ts       # Logic nghiệp vụ + truy vấn Prisma
└── module.validation.ts    # Schema Zod kiểm tra dữ liệu
```

> Service truy vấn Prisma trực tiếp để giữ đơn giản (chưa tách tầng repository riêng). Khi logic một module trở nên phức tạp, có thể bổ sung `module.repository.ts`. Tham khảo module mẫu: [backend/src/modules/products/](backend/src/modules/products/).

**Lợi ích:**
- ✅ Mỗi nghiệp vụ phát triển & test độc lập
- ✅ Dễ thêm/bớt module mà không ảnh hưởng phần còn lại
- ✅ Phân chia công việc rõ ràng giữa các thành viên
- ✅ Tách biệt logic — controller mỏng, service chứa nghiệp vụ

---

## 📁 Cấu Trúc Thư Mục

```
App-banbanh/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # Định nghĩa 12 bảng + enum (gồm chấm công)
│   │   ├── seed.ts                  # Sinh dữ liệu lớn (200 KH, 4000 đơn, 20 NCC...)
│   │   └── banbanh_dump.sql         # Bản dump SQL đầy đủ (restore nhanh, không cần seed)
│   ├── src/
│   │   ├── modules/                 # 🔑 Các module nghiệp vụ (API đã hoàn thiện)
│   │   │   ├── auth/                # Đăng nhập, phân quyền
│   │   │   ├── products/            # Sản phẩm bánh (CRUD)
│   │   │   ├── categories/          # Danh mục (CRUD)
│   │   │   ├── sales/               # Bán hàng (hóa đơn, trừ/hoàn tồn kho)
│   │   │   ├── inventory/           # Quản lý kho (cảnh báo, lịch sử, kiểm kê)
│   │   │   ├── purchasing/          # Nhập hàng (cộng tồn kho tự động)
│   │   │   ├── suppliers/           # Nhà cung cấp (CRUD)
│   │   │   ├── customers/           # Khách hàng (CRUD)
│   │   │   ├── employees/           # Nhân viên (CRUD)
│   │   │   └── reports/             # Báo cáo & thống kê
│   │   │
│   │   ├── common/                  # Code dùng chung
│   │   │   ├── middlewares/         # auth, validate, error
│   │   │   ├── utils/               # response chuẩn, asyncHandler
│   │   │   └── errors/              # AppError & các lỗi nghiệp vụ
│   │   │
│   │   ├── config/                  # env, db (Prisma client)
│   │   ├── routes/                  # Gom route các module
│   │   ├── app.ts                   # Khởi tạo Express app
│   │   └── server.ts                # Entry point
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── modules/                 # Trang theo module
│   │   │   ├── auth/                # LoginPage
│   │   │   └── products/            # ProductsPage (mẫu)
│   │   ├── components/              # ProtectedRoute, PlaceholderPage
│   │   ├── layouts/                 # MainLayout (sidebar + header)
│   │   ├── services/                # api.ts (axios client)
│   │   ├── store/                   # AuthContext
│   │   ├── routes/                  # Định nghĩa route
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docker-compose.yml               # PostgreSQL cho dev
├── README.md                        # Tài liệu này
├── SETUP.md                         # Hướng dẫn cài đặt & chạy
└── CONTRIBUTING.md                  # Phân công & quy ước nhóm
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
| `attendances` | Chấm công nhân viên (số công theo ngày) |

> Schema đầy đủ (kèm enum, quan hệ, kiểu dữ liệu) định nghĩa tại [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

---

## 🚀 Cài Đặt & Chạy Dự Án

> 📖 Hướng dẫn đầy đủ (gồm xử lý lỗi thường gặp) xem tại **[SETUP.md](SETUP.md)**.

### Yêu cầu
- Node.js >= 18
- PostgreSQL >= 15 (hoặc dùng Docker)
- Git

### Cách 1 — Chạy toàn bộ bằng Docker (khuyên dùng)

Chỉ cần Docker, không cần cài Node/PostgreSQL trên máy:

```bash
git clone https://github.com/giangiscoding/QuanLyBanBanh.git
cd QuanLyBanBanh
docker compose up -d --build               # build + chạy PostgreSQL + backend + frontend
docker compose exec backend npm run seed   # nạp dữ liệu mẫu (admin/admin123)
```

- Frontend: http://localhost:8080 — đăng nhập **admin / admin123**
- Backend API: http://localhost:3000 (health check: `/health`)
- Tắt: `docker compose down` (thêm `-v` để xoá luôn dữ liệu)

> Mẹo: đặt `SEED_ON_START=true` cho dịch vụ `backend` trong `docker-compose.yml` để tự seed ngay lần đầu (không cần chạy lệnh seed thủ công).

### Cách 2 — Chạy thủ công (môi trường dev)

```bash
docker compose up -d postgres        # chỉ chạy PostgreSQL (hoặc dùng Postgres cài sẵn)

# Backend
cd backend
npm install
cp .env.example .env                 # chỉnh DATABASE_URL / JWT_SECRET nếu cần
npm run prisma:migrate               # tạo bảng (lần đầu đặt tên: init)
npm run seed                         # tài khoản admin + dữ liệu mẫu
npm run dev                          # http://localhost:3000

# Frontend (mở terminal mới)
cd ../frontend
npm install
npm run dev                          # http://localhost:5173
```

- Frontend (dev): http://localhost:5173 — đăng nhập **admin / admin123**
- Backend API: http://localhost:3000 (health check: `/health`)

### Biến môi trường (`backend/.env`)

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/banbanh?schema=public"
JWT_SECRET=doi-thanh-chuoi-bi-mat-cua-ban
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

---

## 🔌 Tham Chiếu API

Tất cả endpoint đều có tiền tố `/api/v1` và yêu cầu header `Authorization: Bearer <token>` (trừ `/auth/login`). Vai trò trong ngoặc là quyền tối thiểu để gọi.

### Auth — `/auth`
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| POST | `/auth/login` | công khai | Đăng nhập, trả JWT |
| POST | `/auth/register` | ADMIN/MANAGER | Tạo tài khoản đăng nhập |
| GET | `/auth/me` | đã đăng nhập | Thông tin tài khoản hiện tại |

### Products — `/products`
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/products` | đã đăng nhập | Danh sách (lọc `?search=&categoryId=&page=&limit=`) |
| GET | `/products/:id` | đã đăng nhập | Chi tiết |
| POST | `/products` | ADMIN/MANAGER | Tạo sản phẩm |
| PUT | `/products/:id` | ADMIN/MANAGER | Cập nhật |
| DELETE | `/products/:id` | ADMIN/MANAGER | Ngừng kinh doanh (ẩn) |

### Categories — `/categories`
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/categories` | đã đăng nhập | Danh sách (kèm số sản phẩm) |
| GET | `/categories/:id` | đã đăng nhập | Chi tiết |
| POST | `/categories` | ADMIN/MANAGER | Tạo danh mục |
| PUT | `/categories/:id` | ADMIN/MANAGER | Cập nhật |
| DELETE | `/categories/:id` | ADMIN/MANAGER | Xóa (chặn nếu còn sản phẩm) |

### Suppliers — `/suppliers`
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/suppliers` | đã đăng nhập | Danh sách (lọc `?search=`) |
| GET | `/suppliers/:id` | đã đăng nhập | Chi tiết |
| POST | `/suppliers` | ADMIN/MANAGER | Tạo nhà cung cấp |
| PUT | `/suppliers/:id` | ADMIN/MANAGER | Cập nhật |
| DELETE | `/suppliers/:id` | ADMIN/MANAGER | Xóa (chặn nếu còn phiếu nhập) |

### Customers — `/customers`
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/customers`, `/customers/:id` | đã đăng nhập | Danh sách / chi tiết khách hàng |
| POST · PUT | `/customers`, `/customers/:id` | ADMIN/MANAGER/CASHIER | Tạo / cập nhật (SĐT là duy nhất) |
| DELETE | `/customers/:id` | ADMIN/MANAGER | Xóa khách hàng |

### Employees — `/employees`
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/employees`, `/employees/:id` | ADMIN/MANAGER | Danh sách / chi tiết nhân viên |
| GET | `/employees/:id/detail` | ADMIN/MANAGER | Hồ sơ + chấm công (số công tháng/quý/năm) + hiệu suất + đánh giá |
| POST | `/employees` | ADMIN | Tạo hồ sơ nhân viên |
| PUT | `/employees/:id` | ADMIN/MANAGER | Cập nhật hồ sơ (gồm trạng thái) |
| DELETE | `/employees/:id` | ADMIN | Cho nghỉ việc (chuyển `INACTIVE`, **vẫn lưu hồ sơ**) |

### Sales — `/sales`
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/sales` | đã đăng nhập | Danh sách đơn (lọc `?status=&customerId=`) |
| GET | `/sales/:id` | đã đăng nhập | Chi tiết đơn |
| POST | `/sales` | CASHIER↑ | Tạo đơn — **tự động trừ tồn kho** |
| PATCH | `/sales/:id/cancel` | ADMIN/MANAGER | Hủy đơn — **hoàn lại tồn kho** |

### Purchasing — `/purchasing`
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/purchasing` | đã đăng nhập | Danh sách phiếu nhập (lọc `?supplierId=`) |
| GET | `/purchasing/:id` | đã đăng nhập | Chi tiết phiếu nhập |
| POST | `/purchasing` | ADMIN/MANAGER | Tạo phiếu — **tự động cộng tồn kho** |

### Inventory — `/inventory`
| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/inventory/low-stock` | đã đăng nhập | Sản phẩm tồn ≤ ngưỡng tối thiểu |
| GET | `/inventory/history` | đã đăng nhập | Lịch sử xuất/nhập (lọc `?productId=`) |
| POST | `/inventory/adjust` | ADMIN/MANAGER | Kiểm kê — đặt tồn về số đếm thực tế |

### Reports — `/reports` (chỉ ADMIN/MANAGER)
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/reports/revenue` | Doanh thu, giá vốn, lợi nhuận (`?from=&to=`) |
| GET | `/reports/revenue-by-day` | Doanh thu theo ngày (cho biểu đồ) |
| GET | `/reports/top-products` | Top sản phẩm bán chạy (`?limit=`) |
| GET | `/reports/inventory` | Giá trị tồn kho, danh sách sắp hết |

> 💡 Quy ước trừ/cộng tồn kho tập trung tại `inventoryService.stockMovement()` ([backend/src/modules/inventory/inventory.service.ts](backend/src/modules/inventory/inventory.service.ts)) — mọi module thay đổi kho đều gọi qua hàm này trong cùng một transaction để đảm bảo nhất quán.

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

- [x] **Giai đoạn 0 — Scaffold:** Cấu trúc dự án, Prisma schema, nền tảng chung, module Auth, module Products mẫu
- [x] **Giai đoạn 1 — Sản phẩm & Kho:** Categories (CRUD), Inventory (cảnh báo tồn, lịch sử xuất/nhập, kiểm kê) — *API hoàn thiện*
- [x] **Giai đoạn 2 — Nhập hàng:** Suppliers (CRUD), Purchasing (tạo phiếu nhập, tự động cộng tồn kho) — *API hoàn thiện*
- [x] **Giai đoạn 3 — Bán hàng:** Sales (tạo đơn, trừ tồn kho, hủy đơn hoàn kho), Customers (CRUD) — *API hoàn thiện*
- [x] **Giai đoạn 4 — Nhân sự & Báo cáo:** Employees (CRUD), Reports (doanh thu, lợi nhuận, top sản phẩm, tồn kho) — *API hoàn thiện*
- [x] **Giai đoạn 5 — Frontend:** Trang quản trị cho tất cả module (Sales/POS, Products, Categories, Inventory, Purchasing, Suppliers, Customers, Employees, Reports) — *hoàn thiện*
- [x] **Giai đoạn 6 — Đóng gói Docker:** Dockerfile backend + frontend, `docker compose` chạy cả stack (PostgreSQL + API + web) — *hoàn thiện*
- [ ] **Giai đoạn 7 — Hoàn thiện:** Testing tự động, CI/CD, triển khai production

> ⚙️ **Trạng thái hiện tại:** Toàn bộ **REST API backend** (10 module), **giao diện frontend** và **đóng gói Docker** đã hoàn thiện; build/type-check sạch. Phần còn lại là testing tự động và CI/CD.

---

## 📄 License

MIT
