// Prisma 7 Configuration File
export default {
  datasource: {
    url: process.env.DATABASE_URL || 'file:./dev.db'
  }
};
