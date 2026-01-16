#!/bin/bash
echo "🔧 กำลังแก้ JSX syntax..."
# ใช้ perl เพราะ handle curly braces กับ backticks ได้ดีกว่า zsh

find src -type f -name "*.js" -o -name "*.jsx" | while read file; do
  perl -pi -e 's/className=\{[[:space:]]*'\''className=\{`\$\{([^\}]*)\}`'\''\}/className=`\$\{\1\}`/g' "$file"
  perl -pi -e 's/className=\{\s*className=\{`/className=`/g' "$file"
  perl -pi -e 's/`\}`/`}/g' "$file"
done

echo "✅ แก้ className syntax แล้ว"
echo "🎨 รัน prettier เพื่อจัด format สวย ๆ"
npx prettier --write src
echo "✅ เสร็จสมบูรณ์!"
