import 'dotenv/config';
import app from './app.js';
import { prisma } from './lib/prisma.js';
import { disconnectRedis, redis } from './lib/redis.js';

const PORT = Number(process.env.PORT) || 3000;

async function connectDependencies(): Promise<void> {
  await prisma.$connect();
  console.log('PostgreSQL connected via Prisma');

  await redis.connect();
}

async function disconnectDependencies(): Promise<void> {
  await prisma.$disconnect();
  await disconnectRedis();
}

async function startServer(): Promise<void> {
  try {
    await connectDependencies();

    const server = app.listen(PORT, () => {
      const env = process.env.NODE_ENV ?? 'development';
      console.log(`Server running on port ${String(PORT)} [${env}]`);
    });

    const shutdown = (signal: string): void => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        void disconnectDependencies()
          .then(() => {
            process.exit(0);
          })
          .catch((error: unknown) => {
            console.error('Error during shutdown:', error);
            process.exit(1);
          });
      });
    };

    process.on('SIGTERM', () => {
      shutdown('SIGTERM');
    });

    process.on('SIGINT', () => {
      shutdown('SIGINT');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await disconnectDependencies();
    process.exit(1);
  }
}

void startServer();
