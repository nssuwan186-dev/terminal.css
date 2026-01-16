#!/bin/bash
echo "🚀 เริ่มแก้ JSX และ Tailwind อัตโนมัติ..."

APP_FILE="./src/App.js"

# ✅ 1. แก้ทุก className ที่ขาด backtick (pattern แบบ {px-3 ... ${...}})
echo "🔧 สแกนและแก้ JSX dynamic className ..."
sed -i -E "s/className=\{([^`\"]*[[:alnum:]-]+\s[^`\"]*)\$\{([^}]*)\}\}/className={\`\1\$\{\2\}\`}/g" "$APP_FILE"

# ✅ 2. แก้ postcss config ให้เป็นแบบใหม่
echo "📦 แก้ PostCSS config ..."
npm install -D @tailwindcss/postcss autoprefixer >/dev/null 2>&1

cat > ./postcss.config.js <<'CONFIG'
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
CONFIG

echo "✅ postcss.config.js เขียนใหม่เรียบร้อย"

# ✅ 3. สรุป
echo ""
echo "🎉 แก้เสร็จแล้ว! ลองรันอีกครั้งด้วยคำสั่ง:"
echo "npm run start"
