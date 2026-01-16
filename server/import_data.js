import mysql from "mysql2/promise";
import dotenv from "dotenv";
import xlsx from "xlsx";
import path from "path";
import fs from "fs";

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

const FILES = {
  MASTER: "/data/data/com.termux/files/home/downloads/DB-Hotel-FullSystem.xlsx",
  TRANSACTIONS: "/data/data/com.termux/files/home/downloads/สมุดบัญชีรายรับและรายจ่ายรายวัน.xlsx",
  PAYROLL: "/data/data/com.termux/files/home/downloads/สรุปจ่ายเงินเดือน 2569.xlsx"
};

async function importData() {
  const connection = await mysql.createConnection(dbConfig);
  console.log("🚀 Starting Data Import...");

  try {
    // 1. Import ห้องพัก (จาก Master File)
    if (fs.existsSync(FILES.MASTER)) {
      const wb = xlsx.readFile(FILES.MASTER);
      // หา Sheet ที่ชื่อ 'Rooms' หรือ 'ห้องพัก' หรือ Sheet แรก
      let sheetName = wb.SheetNames.find(s => s.includes('Room') || s.includes('ห้อง'));
      if (!sheetName) sheetName = wb.SheetNames[0]; // Fallback to first sheet

      if (sheetName) {
        const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
        console.log(`📦 Importing Rooms from ${sheetName}... (${data.length} rows)`);
        
        for (const row of data) {
          // Map Column Name จาก Excel -> DB
          const roomNo = row['RoomNo'] || row['หมายเลขห้อง'] || row['ห้อง'] || row['Room'] || row['NO.'];
          const price = row['Price'] || row['ราคา'] || row['Rate'] || 0;
          const status = 'ว่าง'; 

          if (roomNo) {
            await connection.execute(
              `INSERT INTO ห้องพัก (หมายเลขห้อง, ราคาต่อคืน, สถานะห้อง) 
               VALUES (?, ?, ?) 
               ON DUPLICATE KEY UPDATE ราคาต่อคืน = VALUES(ราคาต่อคืน)`,
              [String(roomNo), price, status]
            );
          }
        }
        console.log("✅ Rooms Imported.");
      }
    }

    // 2. Import พนักงาน (จาก Master File หรือ Payroll File)
    if (fs.existsSync(FILES.PAYROLL)) {
      const wb = xlsx.readFile(FILES.PAYROLL);
      const sheetName = wb.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
      console.log(`📦 Importing Employees from ${sheetName}... (${data.length} rows)`);

      for (const row of data) {
        const name = row['ชื่อ-สกุล'] || row['Name'] || row['พนักงาน'] || row['ชื่อ'];
        const position = row['ตำแหน่ง'] || row['Position'];
        const salary = row['เงินเดือน'] || row['Salary'] || 0;

        if (name) {
           // Insert บริษัท (Dummy) ถ้ายังไม่มี
           await connection.execute(`INSERT IGNORE INTO บริษัท (ชื่อบริษัท) VALUES ('The Apartment')`);
           
           // Insert พนักงาน
           await connection.execute(
             `INSERT INTO พนักงาน (ชื่อ_นามสกุล, ตำแหน่ง, รหัสบริษัท, สถานะ) 
              VALUES (?, ?, (SELECT รหัสบริษัท FROM บริษัท LIMIT 1), 'ทำงาน')
              ON DUPLICATE KEY UPDATE ตำแหน่ง = VALUES(ตำแหน่ง)`,
             [name, position]
           );
           
           // Insert เงินเดือน
           const [emp] = await connection.execute(`SELECT รหัสพนักงาน FROM พนักงาน WHERE ชื่อ_นามสกุล = ?`, [name]);
           if (emp.length > 0) {
              const empId = emp[0].รหัสพนักงาน;
              await connection.execute(`INSERT IGNORE INTO รอบเงินเดือน (เดือน, ปี) VALUES (1, 2569)`);
              
              await connection.execute(
                `INSERT INTO เงินเดือน (รหัสพนักงาน, รหัสรอบ, เงินเดือนพื้นฐาน, เงินสุทธิ)
                 VALUES (?, (SELECT รหัสรอบ FROM รอบเงินเดือน WHERE เดือน=1 AND ปี=2569 LIMIT 1), ?, ?)
                 ON DUPLICATE KEY UPDATE เงินเดือนพื้นฐาน = VALUES(เงินเดือนพื้นฐาน)`,
                [empId, salary, salary] 
              );
           }
        }
      }
      console.log("✅ Employees & Payroll Imported.");
    }

    // 3. Import รายรับรายจ่าย (Transactions)
    if (fs.existsSync(FILES.TRANSACTIONS)) {
      const wb = xlsx.readFile(FILES.TRANSACTIONS);
      const sheetName = wb.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
      console.log(`📦 Importing Transactions... (${data.length} rows)`);

      for (const row of data) {
         const date = row['วันที่'] || new Date();
         const desc = row['รายการ'] || row['รายละเอียด'];
         const income = row['รายรับ'] || 0;
         const expense = row['รายจ่าย'] || 0;
         
         if (desc) {
             if (income > 0) {
                 await connection.execute(
                     `INSERT INTO รายการบัญชี (รายละเอียด, ยอดรวม, วันที่ทำรายการ) VALUES (?, ?, ?)`,
                     [desc, income, date]
                 );
             }
             if (expense > 0) {
                 await connection.execute(
                     `INSERT INTO รายการบัญชี (รายละเอียด, ยอดรวม, วันที่ทำรายการ) VALUES (?, ?, ?)`,
                     [desc, -expense, date]
                 );
             }
         }
      }
      console.log("✅ Transactions Imported.");
    }

  } catch (err) {
    console.error("❌ Import Failed:", err);
  } finally {
    await connection.end();
    console.log("🏁 Import Process Finished.");
  }
}

importData();