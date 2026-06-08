# ⚙️ Hướng Dẫn Cài Đặt & Chạy Dự Án

Hướng dẫn này dành cho mọi thành viên trong nhóm để chạy được dự án trên máy mình.

> ⚠️ **Lưu ý:** Khung dự án (scaffold) được tạo sẵn nhưng **chưa cài dependency và chưa chạy thử** (máy tạo scaffold không có Node.js). Mỗi người tự cài Node.js rồi làm theo các bước dưới.

---

## 1. Cài công cụ cần thiết

| Công cụ | Phiên bản | Link |
|---------|-----------|------|
| **Node.js** | >= 18 (khuyến nghị 20 LTS) | https://nodejs.org |
| **PostgreSQL** | >= 15 | https://www.postgresql.org/download (hoặc dùng Docker) |
| **Git** | mới nhất | https://git-scm.com |

Kiểm tra sau khi cài:
```bash
node -v
npm -v
```

---

## 2. Clone dự án

```bash
git clone https://github.com/giangiscoding/QuanLyBanBanh.git
cd QuanLyBanBanh
```

---

## 3. Chuẩn bị Database (PostgreSQL)

**Cách A — Dùng Docker (dễ nhất, khuyến nghị):**
```bash
docker compose up -d
```
Lệnh này tạo sẵn database `banbanh` (user `postgres` / pass `password`).

**Cách B — Cài PostgreSQL thủ công:** tự tạo một database tên `banbanh`, rồi sửa lại `DATABASE_URL` trong `backend/.env` cho khớp user/password của bạn.

---

## 4. Chạy Backend

```bash
cd backend

# 1. Cài thư viện
npm install

# 2. Tạo file cấu hình môi trường
cp .env.example .env
#   (Windows PowerShell: copy .env.example .env)
#   Sửa DATABASE_URL / JWT_SECRET trong .env nếu cần

# 3. Tạo bảng trong DB từ Prisma schema
npm run prisma:migrate
#   (lần đầu sẽ hỏi đặt tên migration, gõ: init)

# 4. Tạo dữ liệu mẫu + tài khoản admin
npm run seed

# 5. Chạy server (chế độ dev, tự reload)
npm run dev
```

- Backend chạy tại: **http://localhost:3000**
- Kiểm tra: mở http://localhost:3000/health → thấy `{"success":true,...}`
- Tài khoản mặc định: **admin / admin123**

### Lệnh backend hữu ích
| Lệnh | Tác dụng |
|------|----------|
| `npm run dev` | Chạy server dev (tự reload) |
| `npm run prisma:migrate` | Tạo/cập nhật bảng khi sửa `schema.prisma` |
| `npm run prisma:studio` | Mở giao diện xem/sửa DB trên trình duyệt |
| `npm run prisma:generate` | Tạo lại Prisma Client sau khi đổi schema |
| `npm run seed` | Nạp lại dữ liệu mẫu |
| `npm run build` | Biên dịch TypeScript ra `dist/` |

---

## 4b. Dữ liệu mẫu (cho cả nhóm)

Có **2 cách** để có sẵn dữ liệu làm việc (sản phẩm, danh mục, nhà cung cấp, khách hàng, nhân viên, đơn hàng, phiếu nhập):

**Cách 1 — Chạy seed (khuyến nghị):** chạy lại được nhiều lần, luôn về trạng thái sạch.
```bash
cd backend
npm run seed
```

**Cách 2 — Nạp file dump SQL** ([backend/prisma/dump.sql](backend/prisma/dump.sql)) vào một DB trống:
```bash
# Tao DB moi roi nap dump (vi du ten banbanh)
PGPASSWORD=password psql -h localhost -U postgres -d banbanh -f backend/prisma/dump.sql
```

> ⚠️ `dump.sql` chứa cả cấu trúc bảng + dữ liệu, nên chỉ nạp vào **DB trống** (chưa chạy `prisma migrate`). Nếu DB đã có bảng thì dùng Cách 1.

**Tài khoản có sẵn:**

| Username | Mật khẩu | Vai trò |
|----------|----------|---------|
| `admin` | `admin123` | ADMIN |
| `manager` | `123456` | MANAGER |
| `cashier` | `123456` | CASHIER (thu ngân) |
| `staff` | `123456` | STAFF |

---

## 5. Chạy Frontend

Mở **terminal mới** (giữ backend đang chạy):

```bash
cd frontend

# 1. Cài thư viện
npm install

# 2. (Tùy chọn) tạo file env
cp .env.example .env

# 3. Chạy
npm run dev
```

- Frontend chạy tại: **http://localhost:5173**
- Mở trình duyệt → đăng nhập bằng **admin / admin123**

> Frontend đã cấu hình proxy `/api` → `http://localhost:3000`, nên không lo lỗi CORS khi dev.

---

## 6. Quy trình làm việc hằng ngày

```bash
git pull origin main                 # lấy code mới nhất
git checkout -b feature/<module>-...  # tạo nhánh cho tính năng của bạn

# ... code ...

git add .
git commit -m "feat(<module>): mo ta ngan"
git push -u origin feature/<module>-...
# Vào GitHub tạo Pull Request, nhờ thành viên khác review rồi merge
```

Xem phân công & quy ước chi tiết tại [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 7. Cách thêm một module mới (mẫu)

Copy theo cấu trúc module `products` ở backend:
```
backend/src/modules/<ten-module>/
├── <ten-module>.validation.ts   # schema Zod kiem tra input
├── <ten-module>.service.ts      # logic nghiep vu + truy van Prisma
├── <ten-module>.controller.ts   # nhan request, goi service, tra response
└── <ten-module>.routes.ts       # dinh nghia endpoint + middleware
```
Rồi mount route trong [backend/src/routes/index.ts](backend/src/routes/index.ts).

Frontend: tạo trang trong `frontend/src/modules/<ten-module>/` và khai báo trong [frontend/src/routes/index.tsx](frontend/src/routes/index.tsx) (thay `PlaceholderPage`).

> ⚠️ Module cần thay đổi tồn kho (Bán hàng, Nhập hàng) **không tự sửa bảng kho** — phải gọi `inventoryService.stockMovement(...)`. Xem [backend/src/modules/inventory/inventory.service.ts](backend/src/modules/inventory/inventory.service.ts).

---

## 8. Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|-----------|
| `Can't reach database server` | PostgreSQL chưa chạy, hoặc sai `DATABASE_URL` trong `.env` |
| `npm: command not found` | Chưa cài Node.js |
| Port 3000/5432 đang bận | Đổi `PORT` trong `.env`, hoặc tắt tiến trình đang chiếm port |
| Sửa `schema.prisma` xong không thấy đổi | Chạy lại `npm run prisma:migrate` |
