import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'gateway02.us-east-1.prod.aws.tidbcloud.com',
  user: process.env.DB_USER || '3UEtScgPrGx6DTw.c8d1a5469bae',
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME || 'h667ndwT9e7Uvcqqw3D6DU',
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10
};

async function setupDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log("🔌 Connected to Database. Starting Schema Setup...");

    // 1. ตารางข้อมูลห้องพัก (Master Data: Rooms)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_number VARCHAR(10) NOT NULL UNIQUE,
        room_type ENUM('รายวัน', 'รายเดือน') DEFAULT 'รายเดือน',
        price DECIMAL(10, 2) DEFAULT 0.00,
        status ENUM('ว่าง', 'มีผู้เช่า', 'จองแล้ว', 'ปิดปรับปรุง') DEFAULT 'ว่าง',
        meter_water_last DECIMAL(10, 2) DEFAULT 0.00,
        meter_electric_last DECIMAL(10, 2) DEFAULT 0.00,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'rooms' ready.");

    // 2. ตารางผู้เช่า (Master Data: Guests)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS guests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        id_card VARCHAR(20),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'guests' ready.");

    // 3. ตารางการจอง/เข้าพัก (Booking / Lease)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT,
        guest_id INT,
        check_in_date DATE,
        check_out_date DATE,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        FOREIGN KEY (room_id) REFERENCES rooms(id),
        FOREIGN KEY (guest_id) REFERENCES guests(id)
      )
    `);
    console.log("✅ Table 'bookings' ready.");

    // 4. ตารางธุรกรรมการเงิน (Transactions - รายรับ/รายจ่าย)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_date DATE NOT NULL,
        type ENUM('รายรับ', 'รายจ่าย') NOT NULL,
        category VARCHAR(100), -- เช่น 'ค่าเช่า', 'ค่าไฟ', 'เงินเดือนพนักงาน'
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        related_id INT, -- อ้างอิง booking_id หรือ employee_id
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'transactions' ready.");

    // 5. ตารางพนักงาน (Master Data: Employees)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(100),
        base_salary DECIMAL(10, 2) DEFAULT 0.00,
        social_security DECIMAL(10, 2) DEFAULT 0.00,
        start_date DATE,
        status ENUM('active', 'resigned') DEFAULT 'active'
      )
    `);
    console.log("✅ Table 'employees' ready.");

    // 6. ตารางเงินเดือน (Payroll)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payrolls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT,
        month INT NOT NULL,
        year INT NOT NULL,
        salary_base DECIMAL(10, 2),
        overtime DECIMAL(10, 2) DEFAULT 0.00,
        deductions DECIMAL(10, 2) DEFAULT 0.00,
        net_salary DECIMAL(10, 2),
        payment_date DATE,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);
    console.log("✅ Table 'payrolls' ready.");

    console.log("\n🎉 All Tables Created Successfully!");

  } catch (err) {
    console.error("❌ Error setting up database:", err);
  } finally {
    await connection.end();
  }
}

setupDatabase();
