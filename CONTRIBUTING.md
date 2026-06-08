# 🤝 Hướng Dẫn Cộng Tác & Phân Công Công Việc

Tài liệu này mô tả cách nhóm (3 thành viên) phối hợp phát triển hệ thống Quản Lý Bán Bánh. Xem thêm kiến trúc tổng quan tại [README.md](README.md).

---

## 🎯 Nguyên Tắc Chia Việc

Nhóm chia việc **theo chiều dọc (full-stack theo module)** — mỗi người sở hữu trọn vẹn vài module từ backend đến frontend.

- ✅ Đúng tinh thần kiến trúc modular
- ✅ Ít đụng code của nhau → ít merge conflict
- ✅ Trách nhiệm rõ ràng, dễ review

> ❌ Không chia ngang theo tầng (1 người backend, 1 frontend, 1 DB) vì gây nút thắt cổ chai: frontend phải chờ backend mới làm được.

---

## 🚦 Bước 0 — Làm Chung Trước (cả 3 người)

Phần nền tảng mọi module đều phụ thuộc, **phải thống nhất trước khi tách ra**:

- [ ] Chốt **schema database** (các bảng & quan hệ)
- [ ] Scaffold dự án (backend + frontend), kết nối DB
- [ ] Thống nhất **quy ước API** (format response, error, đặt tên)
- [ ] Setup Git, branch strategy, biến môi trường chung
- [ ] Thống nhất **interface module Kho** (xem phần ⚠️ bên dưới)

---

## 👥 Bảng Phân Công

Nhóm 9 module thành 3 cụm theo luồng nghiệp vụ liên quan:

| Người | Cụm phụ trách | Module | Vai trò |
|-------|--------------|--------|---------|
| **Người 1** (Trưởng nhóm) | Nền tảng & Sản phẩm | `Auth` + `Products`/Categories + `Reports` | Lo infra chung, layout, phân quyền; Reports làm cuối |
| **Người 2** | Luồng Cung ứng – Kho | `Suppliers` + `Purchasing` (nhập hàng) + `Inventory` (kho) | Nhập hàng → cộng tồn kho |
| **Người 3** | Luồng Bán hàng | `Customers` + `Sales` (POS) + `Employees` | Bán hàng → trừ tồn kho |

**Lý do nhóm như vậy:**
- Nhập hàng + Kho dính chặt (nhập → cộng tồn) → để 1 người làm trọn.
- Bán hàng (POS) là module phức tạp nhất → ghép với module nhẹ (Customers/Employees) để cân bằng khối lượng.
- Auth + nền tảng giao cho trưởng nhóm vì mọi người đều phụ thuộc; Reports làm sau cùng vì cần dữ liệu từ mọi module.

---

## ⚠️ Điểm Phối Hợp Quan Trọng: Module Kho (Inventory)

`Inventory` là điểm giao của cả 3 luồng:

- **Người 2** (Nhập hàng) → **cộng** tồn kho
- **Người 3** (Bán hàng) → **trừ** tồn kho

**Quy tắc:**
- **Người 2 sở hữu Inventory** và định nghĩa sớm một service chung, ví dụ:

  ```js
  // inventory.service.js
  stockMovement({ productId, quantity, type }); // type: 'IN' | 'OUT'
  ```

- **Người 3** (Sales) chỉ **gọi service** này, KHÔNG tự truy vấn/sửa bảng kho.
- "Hợp đồng" (interface) này phải chốt từ **Bước 0** để 2 người chạy song song không vướng nhau.

---

## 🔢 Thứ Tự Ưu Tiên (do có phụ thuộc)

```
Auth + Products       →  phải xong trước (mọi thứ cần sản phẩm & đăng nhập)
        ↓
Suppliers / Customers →  master data, làm song song
        ↓
Purchasing + Inventory  +  Sales   →  làm song song
        ↓
Reports               →  cuối cùng (cần dữ liệu mọi module)
```

> Trong lúc Người 1 làm Auth/nền tảng, Người 2 & 3 không ngồi chờ — bắt tay vào **Suppliers/Customers** (master data đơn giản, ít phụ thuộc) để khởi động.

---

## 🌿 Quy Trình Git

### Branch
- `main` — nhánh ổn định, chỉ merge qua Pull Request
- `develop` — nhánh tích hợp (tùy chọn)
- `feature/<module>-<mô-tả>` — vd: `feature/sales-pos-screen`
- `fix/<mô-tả>` — sửa lỗi

### Commit ([Conventional Commits](https://www.conventionalcommits.org/))
- `feat:` thêm tính năng
- `fix:` sửa lỗi
- `refactor:` tái cấu trúc
- `docs:` tài liệu
- `test:` thêm test
- `chore:` việc lặt vặt (config, deps)

Ví dụ: `feat(inventory): them service stockMovement`

### Pull Request
- Mỗi tính năng tạo 1 PR vào `main` (hoặc `develop`)
- Cần **ít nhất 1 người review** trước khi merge
- Mô tả rõ PR làm gì, ảnh hưởng module nào
- Tránh PR quá lớn — chia nhỏ theo từng tính năng

---

## ✅ Quy Ước Code

- **File:** `kebab-case` hoặc `module.layer.js` (vd: `sales.service.js`)
- **Biến/hàm:** `camelCase`
- **Class/Component:** `PascalCase`
- **Bảng DB:** `snake_case`, số nhiều (vd: `order_items`)
- **Hằng số:** `UPPER_SNAKE_CASE`
- Controller mỏng → logic ở service → SQL ở repository
- Không gọi trực tiếp DB của module khác; giao tiếp qua **service**

---

## 💬 Giao Tiếp Nhóm

- Họp đồng bộ ngắn (15 phút) đầu mỗi buổi/ngày: ai làm gì, vướng gì
- Thay đổi ảnh hưởng module khác (schema, API chung) → báo cả nhóm trước
- Mọi quyết định chung (đổi schema, đổi quy ước) ghi lại trong tài liệu này hoặc README
