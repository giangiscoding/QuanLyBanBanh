import {
  PrismaClient,
  Prisma,
  Role,
  OrderStatus,
  PaymentMethod,
  PurchaseStatus,
  StockMovementType,
  AttendanceStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ===================== CAU HINH QUY MO DU LIEU =====================
const SUPPLIER_COUNT = 20;
const CUSTOMER_COUNT = 200;
const ORDER_COUNT = 4000;
const DAYS_BACK = 365; // don hang trai deu trong 1 nam gan day

// ===================== HAM TIEN ICH NGAU NHIEN =====================
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const chance = (p: number) => Math.random() < p;
const roundThousand = (n: number) => Math.round(n / 1000) * 1000;

function randomDate(daysBack: number): Date {
  const now = Date.now();
  const past = now - daysBack * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

// Chia mot tong thanh k phan duong (moi phan >= 1)
function splitInto(total: number, k: number): number[] {
  if (total <= 0) return [];
  if (k <= 1 || total <= k) return [total];
  const cuts = new Set<number>();
  while (cuts.size < k - 1) cuts.add(rand(1, total - 1));
  const sorted = [...cuts].sort((a, b) => a - b);
  const parts: number[] = [];
  let prev = 0;
  for (const c of sorted) {
    parts.push(c - prev);
    prev = c;
  }
  parts.push(total - prev);
  return parts.filter((p) => p > 0);
}

// Chen theo lo de tranh vuot gioi han tham so cua PostgreSQL
async function chunked<T>(rows: T[], size: number, fn: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) {
    await fn(rows.slice(i, i + size));
  }
}

async function main() {
  console.log('🌱 Seed du lieu hoan chinh (quy mo lon)...');
  const t0 = Date.now();

  // --- Xoa du lieu cu theo thu tu khoa ngoai ---
  await prisma.stockMovement.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  // ===================== USERS + EMPLOYEES =====================
  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@banbanh.local',
      passwordHash: adminPass,
      role: Role.ADMIN,
      employee: {
        create: {
          fullName: 'Quan Tri Vien',
          position: 'Admin',
          phone: '0900000000',
          email: 'admin.qtv@banbanh.vn',
          gender: 'MALE',
          dateOfBirth: new Date(Date.UTC(1988, 2, 15)),
          citizenId: '079088001234',
          address: '12 Nguyen Hue, Quan 1, TP.HCM',
          emergencyContact: 'Nguyen Thi Lan (vo) - 0911222333',
          hiredAt: new Date(Date.UTC(2020, 0, 6)),
        },
      },
    },
    include: { employee: true },
  });
  const manager = await prisma.user.create({
    data: {
      username: 'manager',
      passwordHash: userPass,
      role: Role.MANAGER,
      employee: {
        create: {
          fullName: 'Tran Quan Ly',
          position: 'Quan ly cua hang',
          phone: '0900000001',
          salary: 15000000,
          email: 'quanly@banbanh.vn',
          gender: 'MALE',
          dateOfBirth: new Date(Date.UTC(1990, 6, 22)),
          citizenId: '079090005678',
          address: '45 Le Loi, Quan 3, TP.HCM',
          emergencyContact: 'Tran Van Hung (anh) - 0922333444',
          hiredAt: new Date(Date.UTC(2021, 2, 1)),
        },
      },
    },
    include: { employee: true },
  });
  const cashier = await prisma.user.create({
    data: {
      username: 'cashier',
      passwordHash: userPass,
      role: Role.CASHIER,
      employee: {
        create: {
          fullName: 'Le Thu Ngan',
          position: 'Thu ngan',
          phone: '0900000002',
          salary: 8000000,
          email: 'thungan@banbanh.vn',
          gender: 'FEMALE',
          dateOfBirth: new Date(Date.UTC(1998, 10, 5)),
          citizenId: '079198009012',
          address: '78 Cach Mang Thang Tam, Quan 10, TP.HCM',
          emergencyContact: 'Le Van Tam (bo) - 0933444555',
          hiredAt: new Date(Date.UTC(2023, 5, 12)),
        },
      },
    },
    include: { employee: true },
  });
  const staff = await prisma.user.create({
    data: {
      username: 'staff',
      passwordHash: userPass,
      role: Role.STAFF,
      employee: {
        create: {
          fullName: 'Pham Nhan Vien',
          position: 'Nhan vien ban hang',
          phone: '0900000003',
          salary: 7000000,
          email: 'nhanvien@banbanh.vn',
          gender: 'MALE',
          dateOfBirth: new Date(Date.UTC(2000, 3, 18)),
          citizenId: '079200003456',
          address: '90 Vo Van Tan, Quan 3, TP.HCM',
          emergencyContact: 'Pham Thi Hoa (me) - 0944555666',
          hiredAt: new Date(Date.UTC(2024, 1, 20)),
        },
      },
    },
    include: { employee: true },
  });

  // Nhan vien xu ly don (uu tien thu ngan)
  const cashierPool = [
    cashier.employee!.id,
    cashier.employee!.id,
    cashier.employee!.id,
    staff.employee!.id,
    staff.employee!.id,
    manager.employee!.id,
    admin.employee!.id,
  ];
  const buyerPool = [manager.employee!.id, admin.employee!.id];

  // ===================== CATEGORIES =====================
  const categoryNames = ['Banh kem', 'Banh mi', 'Banh ngot', 'Banh quy', 'Do uong'];
  const categories: Record<string, { id: number }> = {};
  for (const name of categoryNames) {
    categories[name] = await prisma.category.create({ data: { name } });
  }

  // ===================== PRODUCTS =====================
  const productSeed = [
    { sku: 'BK001', name: 'Banh kem dau', cat: 'Banh kem', sale: 250000, cost: 150000, min: 3 },
    { sku: 'BK002', name: 'Banh kem socola', cat: 'Banh kem', sale: 280000, cost: 160000, min: 3 },
    { sku: 'BK003', name: 'Banh kem trai cay', cat: 'Banh kem', sale: 320000, cost: 190000, min: 2 },
    { sku: 'BK004', name: 'Banh kem tiramisu', cat: 'Banh kem', sale: 300000, cost: 175000, min: 2 },
    { sku: 'BM001', name: 'Banh mi thit', cat: 'Banh mi', sale: 20000, cost: 10000, min: 15 },
    { sku: 'BM002', name: 'Banh mi pate', cat: 'Banh mi', sale: 18000, cost: 9000, min: 15 },
    { sku: 'BM003', name: 'Banh mi xiu mai', cat: 'Banh mi', sale: 22000, cost: 11000, min: 15 },
    { sku: 'BM004', name: 'Banh mi op la', cat: 'Banh mi', sale: 25000, cost: 12000, min: 10 },
    { sku: 'BN001', name: 'Banh su kem', cat: 'Banh ngot', sale: 15000, cost: 7000, min: 10 },
    { sku: 'BN002', name: 'Banh tiramisu', cat: 'Banh ngot', sale: 35000, cost: 20000, min: 8 },
    { sku: 'BN003', name: 'Banh croissant', cat: 'Banh ngot', sale: 25000, cost: 12000, min: 10 },
    { sku: 'BN004', name: 'Banh muffin', cat: 'Banh ngot', sale: 28000, cost: 14000, min: 8 },
    { sku: 'BN005', name: 'Banh donut', cat: 'Banh ngot', sale: 20000, cost: 10000, min: 10 },
    { sku: 'BQ001', name: 'Banh quy bo (hop)', cat: 'Banh quy', sale: 50000, cost: 30000, min: 5 },
    { sku: 'BQ002', name: 'Cookie socola (hop)', cat: 'Banh quy', sale: 60000, cost: 35000, min: 5 },
    { sku: 'BQ003', name: 'Banh quy hanh nhan (hop)', cat: 'Banh quy', sale: 65000, cost: 38000, min: 4 },
    { sku: 'DU001', name: 'Tra sua tran chau', cat: 'Do uong', sale: 30000, cost: 12000, min: 10 },
    { sku: 'DU002', name: 'Ca phe sua da', cat: 'Do uong', sale: 25000, cost: 8000, min: 10 },
    { sku: 'DU003', name: 'Tra dao cam sa', cat: 'Do uong', sale: 32000, cost: 13000, min: 10 },
    { sku: 'DU004', name: 'Nuoc cam ep', cat: 'Do uong', sale: 28000, cost: 14000, min: 8 },
  ];

  interface ProductRow {
    id: number;
    sku: string;
    sale: number;
    cost: number;
    min: number;
  }
  const products: ProductRow[] = [];
  for (const p of productSeed) {
    const created = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        categoryId: categories[p.cat].id,
        salePrice: p.sale,
        costPrice: p.cost,
        stockQuantity: 0, // se cap nhat lai sau khi tinh nhap - xuat
        minStock: p.min,
      },
    });
    products.push({ id: created.id, sku: p.sku, sale: p.sale, cost: p.cost, min: p.min });
  }

  // ===================== SUPPLIERS (20) =====================
  const supplierPrefix = [
    'Cong ty TNHH', 'Cong ty CP', 'NPP', 'Dai ly', 'Cong ty', 'Co so', 'Xuong', 'Nha cung cap',
  ];
  const supplierCore = [
    'Bot Mi Binh Dong', 'Bo Sua ABC', 'Nguyen Lieu Huong Viet', 'Duong Bien Hoa', 'Trung Ga Ba Huan',
    'Socola Belcholat', 'Kem Tuoi Anchor', 'Trai Cay Da Lat', 'Tra Phuc Long', 'Ca Phe Trung Nguyen',
    'Bao Bi Tan Tien', 'Phu Gia Thuc Pham', 'Hat Hanh Nhan California', 'Sua Vinamilk', 'Mut Trai Cay Hong Lam',
    'Bot Tron San', 'Vani Phap', 'Pho Mai Con Bo Cuoi', 'Tinh Bot Bap', 'Men Banh Mi Saf',
  ];
  const supplierRows: Prisma.SupplierCreateManyInput[] = [];
  for (let i = 0; i < SUPPLIER_COUNT; i++) {
    supplierRows.push({
      name: `${supplierPrefix[i % supplierPrefix.length]} ${supplierCore[i]}`,
      phone: `028${String(10000000 + i).slice(-7)}`,
      email: `sale${i + 1}@ncc-banbanh.vn`,
      address: `${rand(1, 350)} Duong so ${rand(1, 50)}, Quan ${rand(1, 12)}, TP.HCM`,
    });
  }
  await prisma.supplier.createMany({ data: supplierRows });
  const suppliers = await prisma.supplier.findMany({ select: { id: true } });

  // ===================== CUSTOMERS (200) =====================
  const ho = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Huynh', 'Phan', 'Vu', 'Vo', 'Dang', 'Bui', 'Do', 'Ho', 'Ngo', 'Duong', 'Ly', 'Dao', 'Trinh', 'Dinh', 'Mai'];
  const dem = ['Van', 'Thi', 'Hoang', 'Minh', 'Thanh', 'Quoc', 'Gia', 'Ngoc', 'Thu', 'Hong', 'Anh', 'Duc', 'Hai', 'Kim', 'Phuong', 'Tuan', 'Bao', 'Khanh'];
  const ten = ['An', 'Binh', 'Cuong', 'Dung', 'Phong', 'Giang', 'Ha', 'Huy', 'Khoa', 'Lan', 'Mai', 'Nam', 'Oanh', 'Phuc', 'Quan', 'Son', 'Trang', 'Uyen', 'Vy', 'Yen', 'Tu', 'Linh', 'Long', 'Hieu', 'Tin', 'Thao', 'Nhi', 'Phat', 'Loc', 'Tam'];
  const customerRows: Prisma.CustomerCreateManyInput[] = [];
  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    const fullName = `${pick(ho)} ${pick(dem)} ${pick(ten)}`;
    customerRows.push({
      fullName,
      phone: `09${String(12000000 + i)}`,
      email: chance(0.3) ? `kh${i + 1}@gmail.com` : null,
      address: chance(0.6) ? `${rand(1, 300)} Duong ${pick(ten)}, Quan ${rand(1, 12)}, TP.HCM` : null,
      points: rand(0, 800),
      createdAt: randomDate(DAYS_BACK),
    });
  }
  await prisma.customer.createMany({ data: customerRows });
  const customers = await prisma.customer.findMany({ select: { id: true } });
  const customerIds = customers.map((c) => c.id);

  // ===================== TAO DON HANG (4000) =====================
  // Buoc 1: dung du lieu don hang trong bo nho + tinh tong xuat kho moi san pham
  interface PlannedItem { productId: number; quantity: number; unitPrice: number; subtotal: number }
  interface PlannedOrder {
    code: string;
    customerId: number | null;
    employeeId: number;
    totalAmount: number;
    discount: number;
    finalAmount: number;
    paymentMethod: PaymentMethod;
    status: OrderStatus;
    note: string | null;
    createdAt: Date;
    items: PlannedItem[];
  }

  const outQty: Record<number, number> = {};
  for (const p of products) outQty[p.id] = 0;

  const payments = [
    PaymentMethod.CASH, PaymentMethod.CASH, PaymentMethod.CASH,
    PaymentMethod.TRANSFER, PaymentMethod.TRANSFER,
    PaymentMethod.CARD,
  ];

  const plannedOrders: PlannedOrder[] = [];
  for (let i = 0; i < ORDER_COUNT; i++) {
    const nItems = rand(1, 4);
    const chosen = new Set<number>();
    const items: PlannedItem[] = [];
    for (let j = 0; j < nItems; j++) {
      const p = pick(products);
      if (chosen.has(p.id)) continue;
      chosen.add(p.id);
      const quantity = rand(1, 4);
      const unitPrice = p.sale;
      items.push({ productId: p.id, quantity, unitPrice, subtotal: unitPrice * quantity });
    }
    const totalAmount = items.reduce((s, it) => s + it.subtotal, 0);
    const discount = chance(0.2) ? roundThousand(totalAmount * (rand(5, 15) / 100)) : 0;
    const finalAmount = Math.max(0, totalAmount - discount);
    const status = chance(0.04) ? OrderStatus.CANCELLED : OrderStatus.COMPLETED;

    if (status === OrderStatus.COMPLETED) {
      for (const it of items) outQty[it.productId] += it.quantity;
    }

    plannedOrders.push({
      code: `HD${String(i + 1).padStart(5, '0')}`,
      customerId: chance(0.85) ? pick(customerIds) : null,
      employeeId: pick(cashierPool),
      totalAmount,
      discount,
      finalAmount,
      paymentMethod: pick(payments),
      status,
      note: null,
      createdAt: randomDate(DAYS_BACK),
      items,
    });
  }

  // Buoc 2: chen don hang (bulk) roi lay lai id theo code
  const orderRows: Prisma.OrderCreateManyInput[] = plannedOrders.map((o) => ({
    code: o.code,
    customerId: o.customerId,
    employeeId: o.employeeId,
    totalAmount: o.totalAmount,
    discount: o.discount,
    finalAmount: o.finalAmount,
    paymentMethod: o.paymentMethod,
    status: o.status,
    note: o.note,
    createdAt: o.createdAt,
  }));
  await chunked(orderRows, 1000, (b) => prisma.order.createMany({ data: b }));

  const createdOrders = await prisma.order.findMany({ select: { id: true, code: true, createdAt: true, status: true } });
  const orderIdByCode = new Map(createdOrders.map((o) => [o.code, o.id]));

  // Buoc 3: chen chi tiet don + bien dong xuat kho (chi don COMPLETED)
  const orderItemRows: Prisma.OrderItemCreateManyInput[] = [];
  const outMovementRows: Prisma.StockMovementCreateManyInput[] = [];
  for (const o of plannedOrders) {
    const orderId = orderIdByCode.get(o.code)!;
    for (const it of o.items) {
      orderItemRows.push({
        orderId,
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        subtotal: it.subtotal,
      });
      if (o.status === OrderStatus.COMPLETED) {
        outMovementRows.push({
          productId: it.productId,
          type: StockMovementType.OUT,
          quantity: it.quantity,
          referenceType: 'ORDER',
          referenceId: orderId,
          note: `Ban theo don ${o.code}`,
          createdAt: o.createdAt,
        });
      }
    }
  }
  await chunked(orderItemRows, 2000, (b) => prisma.orderItem.createMany({ data: b }));
  await chunked(outMovementRows, 2000, (b) => prisma.stockMovement.createMany({ data: b }));

  // ===================== PHIEU NHAP HANG (dam bao ton kho duong) =====================
  // Ton kho cuoi mong muon: phan lon du dung, vai san pham co tinh de "sap het".
  const lowStockIds = new Set<number>();
  const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
  for (const p of shuffledProducts.slice(0, 3)) lowStockIds.add(p.id);

  // Lo nhap: { productId, qty, unitCost }
  interface Lot { productId: number; qty: number; unitCost: number }
  const lots: Lot[] = [];
  const desiredFinalStock: Record<number, number> = {};
  for (const p of products) {
    const finalStock = lowStockIds.has(p.id) ? rand(0, p.min) : p.min * rand(4, 10) + rand(0, 60);
    desiredFinalStock[p.id] = finalStock;
    const neededIn = outQty[p.id] + finalStock;
    if (neededIn <= 0) continue;
    const parts = splitInto(neededIn, rand(1, 3));
    for (const qty of parts) lots.push({ productId: p.id, qty, unitCost: p.cost });
  }

  // Gom cac lo thanh phieu nhap (moi phieu 2-5 lo)
  lots.sort(() => Math.random() - 0.5);
  interface PlannedPO { code: string; supplierId: number; employeeId: number; totalAmount: number; createdAt: Date; items: Lot[] }
  const plannedPOs: PlannedPO[] = [];
  let poIndex = 0;
  for (let i = 0; i < lots.length; ) {
    const take = rand(2, 5);
    const batch = lots.slice(i, i + take);
    i += take;
    poIndex++;
    plannedPOs.push({
      code: `PN${String(poIndex).padStart(5, '0')}`,
      supplierId: pick(suppliers).id,
      employeeId: pick(buyerPool),
      totalAmount: batch.reduce((s, l) => s + l.qty * l.unitCost, 0),
      createdAt: randomDate(DAYS_BACK),
      items: batch,
    });
  }

  const poRows: Prisma.PurchaseOrderCreateManyInput[] = plannedPOs.map((po) => ({
    code: po.code,
    supplierId: po.supplierId,
    employeeId: po.employeeId,
    totalAmount: po.totalAmount,
    status: PurchaseStatus.RECEIVED,
    note: 'Nhap hang dinh ky',
    createdAt: po.createdAt,
  }));
  await chunked(poRows, 1000, (b) => prisma.purchaseOrder.createMany({ data: b }));
  const createdPOs = await prisma.purchaseOrder.findMany({ select: { id: true, code: true } });
  const poIdByCode = new Map(createdPOs.map((p) => [p.code, p.id]));

  const poItemRows: Prisma.PurchaseOrderItemCreateManyInput[] = [];
  const inMovementRows: Prisma.StockMovementCreateManyInput[] = [];
  for (const po of plannedPOs) {
    const purchaseOrderId = poIdByCode.get(po.code)!;
    for (const l of po.items) {
      poItemRows.push({
        purchaseOrderId,
        productId: l.productId,
        quantity: l.qty,
        unitCost: l.unitCost,
        subtotal: l.qty * l.unitCost,
      });
      inMovementRows.push({
        productId: l.productId,
        type: StockMovementType.IN,
        quantity: l.qty,
        referenceType: 'PURCHASE',
        referenceId: purchaseOrderId,
        note: `Nhap tu phieu ${po.code}`,
        createdAt: po.createdAt,
      });
    }
  }
  await chunked(poItemRows, 2000, (b) => prisma.purchaseOrderItem.createMany({ data: b }));
  await chunked(inMovementRows, 2000, (b) => prisma.stockMovement.createMany({ data: b }));

  // ===================== CAP NHAT TON KHO = TONG NHAP - TONG XUAT =====================
  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: { stockQuantity: desiredFinalStock[p.id] },
    });
  }

  // ===================== CHAM CONG (ATTENDANCE) =====================
  // Sinh du lieu cham cong cho 4 nhan vien trong 1 nam (lam viec T2-T7).
  const allEmployees = [admin.employee!, manager.employee!, cashier.employee!, staff.employee!];
  const attendanceRows: Prisma.AttendanceCreateManyInput[] = [];
  const today = new Date();
  for (let d = DAYS_BACK; d >= 0; d--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - d);
    if (dt.getDay() === 0) continue; // Chu nhat nghi
    const workDate = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
    for (const emp of allEmployees) {
      const r = Math.random();
      const status =
        r < 0.86 ? AttendanceStatus.PRESENT
        : r < 0.92 ? AttendanceStatus.HALF_DAY
        : r < 0.97 ? AttendanceStatus.LEAVE
        : AttendanceStatus.ABSENT;
      attendanceRows.push({ employeeId: emp.id, workDate, status });
    }
  }
  await chunked(attendanceRows, 2000, (b) => prisma.attendance.createMany({ data: b }));

  // ===================== TONG KET =====================
  const counts = {
    users: await prisma.user.count(),
    products: await prisma.product.count(),
    categories: await prisma.category.count(),
    suppliers: await prisma.supplier.count(),
    customers: await prisma.customer.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    purchaseOrders: await prisma.purchaseOrder.count(),
    purchaseOrderItems: await prisma.purchaseOrderItem.count(),
    stockMovements: await prisma.stockMovement.count(),
  };
  console.log('✅ Seed xong sau', ((Date.now() - t0) / 1000).toFixed(1), 'giay:', counts);
  console.log('   👤 Tai khoan: admin/admin123 (ADMIN) · manager/123456 · cashier/123456 · staff/123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
