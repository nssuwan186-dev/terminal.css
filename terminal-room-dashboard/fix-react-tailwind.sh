#!/bin/bash
echo "🧰 กำลังแก้ไขไฟล์ App.js และตั้งค่า Tailwind/PostCSS..."

# 1️⃣ แก้ JSX Syntax Error อัตโนมัติ
# หาบรรทัดที่มี className={${s.color} ... แล้วแก้เป็น template literal ที่ถูกต้อง
APP_FILE="./src/App.js"
if grep -q 'className={\${s.color}' "$APP_FILE"; then
  sed -i 's/className={\${s.color} p-4 rounded-2xl text-white}/className={`\${s.color} p-4 rounded-2xl text-white`}/' "$APP_FILE"
  echo "✅ แก้โค้ด JSX ใน App.js แล้ว"
else
  echo "ℹ️ ไม่พบ pattern className ผิดพลาดใน App.js"
fi

# 2️⃣ ติดตั้ง PostCSS Plugin ใหม่
echo "📦 ติดตั้ง @tailwindcss/postcss..."
npm install -D @tailwindcss/postcss autoprefixer >/dev/null 2>&1
echo "✅ ติดตั้งเสร็จแล้ว"

# 3️⃣ แก้ไฟล์ postcss.config.js
POSTCSS_FILE="./postcss.config.js"
cat > "$POSTCSS_FILE" <<'CONFIG'
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
CONFIG

echo "✅ เขียน postcss.config.js ใหม่เรียบร้อย"

# 4️⃣ แนะนำให้รัน build ใหม่
echo ""
echo "🚀 เสร็จแล้ว! รันคำสั่งต่อไปเพื่อทดสอบ:"
echo "npm run start"
