import 'dotenv/config';
import app from './app.js';
import { connectDB, getDBMode } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 BuildMart API Server running on http://localhost:${PORT}`);
    console.log(`📡 Database Mode: [${getDBMode().toUpperCase()}]`);
  });
};

startServer();

export default app;
