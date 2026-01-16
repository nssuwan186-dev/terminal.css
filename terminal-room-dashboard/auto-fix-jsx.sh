#!/bin/bash
# 🔧 Auto Fix JSX className syntax error (Terminal Room Dashboard)
# แก้ className={px-3 py-1 ${...}} → className={`px-3 py-1 ${...}`}
# ใช้ได้ใน Termux / Linux / Git Bash

echo "🔍 กำลังสแกน JSX syntax ที่ผิด..."
find src -type f -name "*.js" | while read file; do
  if grep -q 'className={[^`"]*[a-zA-Z0-9-]\+ [^`"]*${' "$file"; then
    echo "🛠️ กำลังแก้ใน: $file"
    sed -i 's/className={[^}]*\${/className={`&/g' "$file"
  fi
done

echo "✅ ครอบ string className ด้วย backticks แล้ว"
echo "⚙️ แนะนำให้รัน prettier เพื่อจัด format อีกที:"
echo "npx prettier --write src"
