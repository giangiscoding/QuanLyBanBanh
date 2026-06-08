import { createApp } from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`🚀 Server chay tai http://localhost:${env.port}`);
    console.log(`   Moi truong: ${env.nodeEnv}`);
  });

  // Tat server an toan
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} - dang tat server...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('❌ Khong the khoi dong server:', err);
  process.exit(1);
});
