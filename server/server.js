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
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME || 'h667ndwT9e7Uvcqqw3D6DU',
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// --- API Endpoints (Thai DB) ---

// 1. ข้อมูลห้องพัก (Rooms)
app.get('/api/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT หมายเลขห้อง as id, ประเภทห้อง as type, สถานะห้อง as status, ราคาต่อคืน as price FROM ห้องพัก ORDER BY หมายเลขห้อง');
    // Map status to match frontend expectations if needed
    const mappedRows = rows.map(r => ({
      ...r,
      status: r.status === 'มีผู้พัก' ? 'เช่าอยู่' : r.status,
      guest: '-', // Data from joined table would go here
      meterE: 0,
      meterW: 0
    }));
    res.json(mappedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 2. ข้อมูลธุรกรรม (Transactions)
app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT รหัสรายการ as id, วันที่ทำรายการ as date, รายละเอียด as `desc`, ยอดรวม as amount FROM รายการบัญชี ORDER BY วันที่ทำรายการ DESC LIMIT 100');
    const mappedRows = rows.map(r => ({
      ...r,
      type: r.amount >= 0 ? 'รายรับ' : 'รายจ่าย',
      amount: Math.abs(r.amount),
      room: '-',
      status: 'สำเร็จ'
    }));
    res.json(mappedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 3. ข้อมูลพนักงาน (Employees)
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT รหัสพนักงานภายใน as id, ชื่อ_นามสกุล as name, ตำแหน่ง as role, สถานะ as status FROM พนักงาน ORDER BY ชื่อ_นามสกุล');
    const mappedRows = rows.map(r => ({
      ...r,
      status: r.status === 'ทำงาน' ? 'ปฏิบัติงาน' : 'พักร้อน'
    }));
    res.json(mappedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 4. แดชบอร์ดสรุป (Dashboard Stats)
app.get('/api/dashboard', async (req, res) => {
  try {
    const [income] = await pool.query("SELECT SUM(ยอดรวม) as total FROM รายการบัญชี WHERE ยอดรวม > 0");
    const [expense] = await pool.query("SELECT SUM(ยอดรวม) as total FROM รายการบัญชี WHERE ยอดรวม < 0");
    const [rooms] = await pool.query("SELECT COUNT(*) as total FROM ห้องพัก WHERE สถานะห้อง = 'ว่าง'");
    
    res.json({
      income: income[0].total || 0,
      expense: Math.abs(expense[0].total || 0),
      vacantRooms: rooms[0].total || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));