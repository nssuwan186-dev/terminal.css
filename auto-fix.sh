#!/bin/bash
echo "🛠️ เริ่มกระบวนการ Auto Fix ทั้งหมด..."

# 1️⃣ แก้ syntax JSX ที่เคยซ้อน className หลายชั้น
echo "🔧 กำลังแก้ JSX className ที่ผิด..."
sed -i 's/className={`className={`className=//g' src/App.js
sed -i 's/className={`className=//g' src/App.js
sed -i 's/`}><s.Icon/`}">\n  <s.Icon/g' src/App.js

# 2️⃣ แก้ tailwind / postcss ให้ถูกต้อง
echo "🧩 ตรวจสอบ Tailwind & PostCSS ..."
npm install -D tailwindcss @tailwindcss/postcss autoprefixer postcss postcss-cli > /dev/null 2>&1

cat > postcss.config.js <<EOF
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOF
echo "✅ postcss.config.js ถูกสร้างใหม่แล้ว!"

# 3️⃣ ตรวจ prettier / eslint และจัด format โค้ดทั้งหมด
echo "🎨 จัดรูปแบบโค้ด..."
npx prettier --write src > /dev/null 2>&1
npx eslint src --fix || true

# 4️⃣ ตรวจ syntax JSX ก่อนเริ่มรัน
echo "🔍 ตรวจสอบ syntax React ก่อน start ..."
npx babel --no-babelrc src/App.js --out-file /dev/null 2>/tmp/check.log
if grep -q "SyntaxError" /tmp/check.log; then
  echo "❌ พบ syntax error ใน src/App.js"
  echo "-------------------------------"
  cat /tmp/check.log
  echo "-------------------------------"
  echo "⚠️ กรุณาเปิดไฟล์ src/App.js และแก้ syntax error ที่แจ้งไว้ด้านบนก่อนรันใหม่"
  exit 1
else
  echo "✅ Syntax React ผ่านการตรวจสอบแล้ว!"
fi

# 5️⃣ เริ่มรันโปรเจกต์
echo "🚀 เริ่มรันโปรเจกต์..."
npm run start
