"""
Сборка интерактивного HTML-отчёта.

Берёт data.json и report/report_template.html, встраивает данные внутрь.
Генерирует self-contained файл report/report.html.
"""
import json
from pathlib import Path

base = Path(__file__).parent
data = json.loads((base / "data.json").read_text())
template = (base / "report" / "report_template.html").read_text()

# Инлайним JSON в HTML
data_str = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
out = template.replace("/*__DATA__*/", data_str)

(base / "report" / "report.html").write_text(out)
size = (base / "report" / "report.html").stat().st_size
print(f"report/report.html сгенерирован: {size/1024:.1f} KB")
