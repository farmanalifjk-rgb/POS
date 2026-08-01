import re

with open('e:/CODING/POS/Base44/POS/frontend/src/modules/core/controllers/pos.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import at top if not present
if 'apiService' not in content:
    content = 'import apiService from "../../../js/services/api.service.js";\n' + content

# Replace hardcoded base URL
content = content.replace('http://127.0.0.1:8000/api', '')

with open('e:/CODING/POS/Base44/POS/frontend/src/modules/core/controllers/pos.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated pos.js with apiService and relative endpoints")
