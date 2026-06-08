import {
  PrismaClient,
  Role,
  OrderStatus,
  PaymentMethod,
  PurchaseStatus,
  StockMovementType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed du lieu mau cho nhom lam viec...');

  // --- Xoa du lieu cu theo thu tu khoa ngoai de seed lai sach (idempotent) ---
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
      employee: { create: { fullName: 'Quan Tri Vien', position: 'Admin', phone: '0900000000' } },
    },
    include: { employee: true },
  });
  const manager = await prisma.user.create({
    data: {
      username: 'manager',
      passwordHash: userPass,
      role: Role.MANAGER,
      employee: {
        create: { fullName: 'Tran Quan Ly', position: 'Quan ly cua hang', phone: '0900000001', salary: 15000000 },
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
        create: { fullName: 'Le Thu Ngan', position: 'Thu ngan', phone: '0900000002', salary: 8000000 },
      },
    },
    include: { employee: true },
  });
  await prisma.user.create({
    data: {
      username: 'staff',
      passwordHash: userPass,
      role: Role.STAFF,
      employee: {
        create: { fullName: 'Pham Nhan Vien', position: 'Nhan vien ban hang', phone: '0900000003', salary: 7000000 },
      },
    },
  });

  // ===================== CATEGORIES =====================
  const categoryNames = ['Banh kem', 'Banh mi', 'Banh ngot', 'Banh quy', 'Do uong'];
  const categories: Record<string, { id: number }> = {};
  for (const name of categoryNames) {
    categories[name] = await prisma.category.create({ data: { name } });
  }

  // ===================== PRODUCTS =====================
  const productSeed = [
    { sku: 'BK001', name: 'Banh kem dau', cat: 'Banh kem', sale: 250000, cost: 150000, stock: 12, min: 3 },
    { sku: 'BK002', name: 'Banh kem socola', cat: 'Banh kem', sale: 280000, cost: 160000, stock: 8, min: 3 },
    { sku: 'BK003', name: 'Banh kem trai cay', cat: 'Banh kem', sale: 320000, cost: 190000, stock: 5, min: 2 },
    { sku: 'BM001', name: 'Banh mi thit', cat: 'Banh mi', sale: 20000, cost: 10000, stock: 60, min: 15 },
    { sku: 'BM002', name: 'Banh mi pate', cat: 'Banh mi', sale: 18000, cost: 9000, stock: 45, min: 15 },
    { sku: 'BN001', name: 'Banh su kem', cat: 'Banh ngot', sale: 15000, cost: 7000, stock: 40, min: 10 },
    { sku: 'BN002', name: 'Banh tiramisu', cat: 'Banh ngot', sale: 35000, cost: 20000, stock: 25, min: 8 },
    { sku: 'BN003', name: 'Banh croissant', cat: 'Banh ngot', sale: 25000, cost: 12000, stock: 30, min: 10 },
    { sku: 'BQ001', name: 'Banh quy bo (hop)', cat: 'Banh quy', sale: 50000, cost: 30000, stock: 20, min: 5 },
    { sku: 'BQ002', name: 'Cookie socola (hop)', cat: 'Banh quy', sale: 60000, cost: 35000, stock: 18, min: 5 },
    { sku: 'DU001', name: 'Tra sua tran chau', cat: 'Do uong', sale: 30000, cost: 12000, stock: 50, min: 10 },
    { sku: 'DU002', name: 'Ca phe sua da', cat: 'Do uong', sale: 25000, cost: 8000, stock: 50, min: 10 },
  ];
  const products: Record<string, { id: number; salePrice: unknown; costPrice: unknown }> = {};
  for (const p of productSeed) {
    products[p.sku] = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        categoryId: categories[p.cat].id,
        salePrice: p.sale,
        costPrice: p.cost,
        stockQuantity: p.stock,
        minStock: p.min,
      },
    });
  }

  // ===================== SUPPLIERS =====================
  const supplierSeed = [
    { name: 'Cong ty Bot Mi Binh Dong', phone: '0281234567', email: 'sales@botmibd.vn', address: 'Quan 8, TP.HCM' },
    { name: 'NPP Bo Sua ABC', phone: '0282345678', email: 'order@abcdairy.vn', address: 'Quan 7, TP.HCM' },
    { name: 'Dai ly Nguyen Lieu Huong Viet', phone: '0283456789', email: 'huongviet@gmail.com', address: 'Thu Duc, TP.HCM' },
  ];
  const suppliers = [];
  for (const s of supplierSeed) suppliers.push(await prisma.supplier.create({ data: s }));

  // ===================== CUSTOMERS =====================
  const customerSeed = [
    { fullName: 'Nguyen Van An', phone: '0911111111', points: 120 },
    { fullName: 'Tran Thi Binh', phone: '0922222222', points: 50 },
    { fullName: 'Le Hoang Cuong', phone: '0933333333', points: 0 },
    { fullName: 'Pham Thi Dung', phone: '0944444444', email: 'dung.pham@gmail.com', points: 300 },
  ];
  const customers = [];
  for (const c of customerSeed) customers.push(await prisma.customer.create({ data: c }));

  // ===================== PHIEU NHAP HANG (mau) =====================
  // Luu y: stockQuantity da set truc tiep o tren; cac ban ghi duoi day la lich su minh hoa.
  const poItems = [
    { sku: 'BM001', qty: 50, cost: 10000 },
    { sku: 'BN001', qty: 40, cost: 7000 },
    { sku: 'DU001', qty: 50, cost: 12000 },
  ];
  const poTotal = poItems.reduce((s, i) => s + i.qty * i.cost, 0);
  const po = await prisma.purchaseOrder.create({
    data: {
      code: 'PN0001',
      supplierId: suppliers[0].id,
      employeeId: manager.employee!.id,
      status: PurchaseStatus.RECEIVED,
      totalAmount: poTotal,
      note: 'Nhap hang dau ky',
      items: {
        create: poItems.map((i) => ({
          productId: products[i.sku].id,
          quantity: i.qty,
          unitCost: i.cost,
          subtotal: i.qty * i.cost,
        })),
      },
    },
  });
  for (const i of poItems) {
    await prisma.stockMovement.create({
      data: {
        productId: products[i.sku].id,
        type: StockMovementType.IN,
        quantity: i.qty,
        referenceType: 'PURCHASE',
        referenceId: po.id,
        note: 'Nhap tu phieu PN0001',
      },
    });
  }

  // ===================== DON HANG (mau) =====================
  const orderSeed = [
    {
      code: 'HD0001',
      customer: customers[0].id,
      payment: PaymentMethod.CASH,
      items: [
        { sku: 'BK001', qty: 1 },
        { sku: 'BM001', qty: 2 },
      ],
    },
    {
      code: 'HD0002',
      customer: customers[3].id,
      payment: PaymentMethod.TRANSFER,
      items: [
        { sku: 'BN002', qty: 3 },
        { sku: 'DU001', qty: 2 },
      ],
    },
    {
      code: 'HD0003',
      customer: null,
      payment: PaymentMethod.CARD,
      items: [{ sku: 'BQ001', qty: 1 }],
    },
  ];
  for (const o of orderSeed) {
    const items = o.items.map((it) => {
      const price = Number(productSeed.find((p) => p.sku === it.sku)!.sale);
      return { productId: products[it.sku].id, quantity: it.qty, unitPrice: price, subtotal: price * it.qty };
    });
    const total = items.reduce((s, i) => s + Number(i.subtotal), 0);
    const order = await prisma.order.create({
      data: {
        code: o.code,
        customerId: o.customer ?? undefined,
        employeeId: cashier.employee!.id,
        totalAmount: total,
        finalAmount: total,
        paymentMethod: o.payment,
        status: OrderStatus.COMPLETED,
        items: { create: items },
      },
    });
    for (const it of o.items) {
      await prisma.stockMovement.create({
        data: {
          productId: products[it.sku].id,
          type: StockMovementType.OUT,
          quantity: it.qty,
          referenceType: 'ORDER',
          referenceId: order.id,
          note: `Ban theo don ${o.code}`,
        },
      });
    }
  }

  // ===================== TONG KET =====================
  const counts = {
    users: await prisma.user.count(),
    products: await prisma.product.count(),
    categories: await prisma.category.count(),
    suppliers: await prisma.supplier.count(),
    customers: await prisma.customer.count(),
    orders: await prisma.order.count(),
    purchaseOrders: await prisma.purchaseOrder.count(),
    stockMovements: await prisma.stockMovement.count(),
  };
  console.log('✅ Seed xong:', counts);
  console.log('   👤 Tai khoan: admin/admin123 (ADMIN) · manager/123456 · cashier/123456 · staff/123456');
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
