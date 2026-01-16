import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const dbConfig = {
  host: process.env.DB_HOST || 'gateway02.us-east-1.prod.aws.tidbcloud.com',
  user: process.env.DB_USER || '3UEtScgPrGx6DTw.c8d1a5469bae',
  password: process.env.DB_PASSWORD, // ต้องใส่รหัสในไฟล์ .env
  database: process.env.DB_NAME || 'h667ndwT9e7Uvcqqw3D6DU',
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test Connection
pool.getConnection()
  .then(conn => {
    console.log('✅ Connected to TiDB Cloud successfully!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// --- API Endpoints ---

// 1. Get All Rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    // Fallback Mock Data (ถ้ายังไม่มีตารางจริง)
    res.json([
       { id: '101', type: 'รายวัน', status: 'ว่าง', price: 500, guest: '-', meterE: 1250, meterW: 450 },
       { id: '102', type: 'รายเดือน', status: 'เช่าอยู่', price: 3500, guest: 'สมชาย ใจดี', phone: '081-234-5678', meterE: 2100, meterW: 880 }
    ]);
  }
});

// 2. Get Transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transactions ORDER BY date DESC, id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    // Fallback Mock Data
    res.json([
       { id: 'T001', date: '2025-01-12', room: '102', amount: 4200, type: 'รายรับ', desc: 'ค่าเช่า + ค่าน้ำไฟ', status: 'สำเร็จ' }
    ]);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));