import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bat dau seed du lieu...');

  // Tai khoan admin mac dinh
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@banbanh.local',
      passwordHash,
      role: Role.ADMIN,
      employee: { create: { fullName: 'Quan tri vien', position: 'Admin' } },
    },
  });
  console.log(`   👤 Admin: username=admin / password=admin123`);

  // Danh muc + san pham mau
  const banhKem = await prisma.category.upsert({
    where: { name: 'Banh kem' },
    update: {},
    create: { name: 'Banh kem', description: 'Cac loai banh kem sinh nhat' },
  });
  const banhMi = await prisma.category.upsert({
    where: { name: 'Banh mi' },
    update: {},
    create: { name: 'Banh mi', description: 'Banh mi cac loai' },
  });

  await prisma.product.upsert({
    where: { sku: 'BK001' },
    update: {},
    create: {
      sku: 'BK001',
      name: 'Banh kem dau',
      categoryId: banhKem.id,
      salePrice: 250000,
      costPrice: 150000,
      stockQuantity: 10,
      minStock: 3,
    },
  });
  await prisma.product.upsert({
    where: { sku: 'BM001' },
    update: {},
    create: {
      sku: 'BM001',
      name: 'Banh mi thit',
      categoryId: banhMi.id,
      salePrice: 20000,
      costPrice: 10000,
      stockQuantity: 50,
      minStock: 10,
    },
  });

  console.log(`   🎂 Da tao danh muc & san pham mau`);
  console.log(`✅ Seed xong! (admin id=${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
