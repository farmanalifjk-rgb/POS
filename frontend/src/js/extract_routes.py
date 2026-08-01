import re

with open('e:/CODING/POS/Base44/POS/frontend/src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the if blocks
route_blocks = re.findall(r'if \((route === .*?)\) \{\s*render\((.*?)\(\), \(\) => window\.(.*?)\?\.\(\)\);\s*return;\s*\}', content, re.DOTALL)

routes_map = "export const routes = [\n"
for condition, page, init_func in route_blocks:
    # clean condition
    paths = [p.strip().strip('"').replace('route === ', '') for p in condition.split('||')]
    paths_str = ', '.join([f'"{p.strip()}"' for p in paths])
    routes_map += f'  {{ paths: [{paths_str}], page: {page}, init: () => window.{init_func}?.() }},\n'
routes_map += "];\n"

with open('e:/CODING/POS/Base44/POS/frontend/src/js/router.js', 'w', encoding='utf-8') as f:
    f.write(routes_map)
print('Wrote router.js')
