import os
import pandas as pd
import re
import html
import unicodedata

def esc(s):
    s = str(s)
    s = s.replace("\r\n", " ").replace("\n", " ").replace("\r", " ").replace("\t", " ")
    s = re.sub(r'\s{2,}', ' ', s).strip()
    return html.escape(s, quote=True)

def slugify(s):
    s = str(s)
    s = unicodedata.normalize("NFD", s)
    s = s.encode("ascii", "ignore").decode("utf-8")
    s = s.replace(":", "_")
    s = s.replace(" ", "_")
    s = re.sub(r"[¿?]", "", s)
    s = re.sub(r"[^a-zA-Z0-9_]", "_", s)
    s = re.sub(r"_+", "_", s)
    return s.strip("_").lower()

img_folder = "img"
logo_placeholder = "agua_sabajo_logo.png"

df = pd.read_excel('LIBRERÍA_AGUAS_ABAJO.xlsx')

df = df[['TÍTULO', 'AUTOR', 'AÑO', 'ISBN', 'EDITORIAL', 'RESUMEN', 'PRECIO VENTA', 'CATEGORIA', 'DIMENSIONES']].fillna({
    'ISBN': "No disponible",
    'AÑO': "No disponible",
    'RESUMEN': "No disponible",
    'CATEGORIA': "Sin categoría",
    'DIMENSIONES': "No disponible"
})

productos_html = ''

for categoria, grupo in df.groupby("CATEGORIA"):
    categoria_id = slugify(categoria)
    productos_html += f'\n<div class="categoria" id="{categoria_id}">\n  <h2>{esc(categoria)}</h2>\n  <div class="row">\n'

    for idx, (_, row) in enumerate(grupo.iterrows()):
        titulo = esc(row['TÍTULO'])
        autor = esc(row['AUTOR'])
        editorial = esc(row['EDITORIAL'])
        resumen = esc(row['RESUMEN'])
        isbn = esc(row['ISBN'])

        if row['AÑO'] == "No disponible":
            año = "No disponible"
        else:
            try:
                año = str(int(float(row['AÑO'])))
            except Exception:
                año = esc(row['AÑO'])

        try:
            precio = int(float(row['PRECIO VENTA']))
        except Exception:
            precio = 0

        titulo_slug = slugify(row['TÍTULO'])

        cover_path = f"{img_folder}/{titulo_slug}_cover.jpg"
        back_path  = f"{img_folder}/{titulo_slug}_back.jpg"
        in_path    = f"{img_folder}/{titulo_slug}_in.jpg"

        if not os.path.exists(cover_path):
            cover_path = logo_placeholder
        if not os.path.exists(back_path):
            back_path = logo_placeholder
        if not os.path.exists(in_path):
            in_path = logo_placeholder

        dimensiones = esc(row['DIMENSIONES'])

        extra_class = " hidden-item" if idx >= 3 else ""

        productos_html += f'''
        <div class="col-md-4{extra_class}">
            <div class="producto">
                <img
                    src="{cover_path}"
                    alt="Portada {titulo}"
                    data-titulo="{titulo}"
                    data-autor="{autor}"
                    data-anio="{año}"
                    data-isbn="{isbn}"
                    data-editorial="{editorial}"
                    data-dimensiones="{dimensiones}"
                    data-resumen="{resumen}"
                    data-precio="{precio}"
                    data-cover="{cover_path}"
                    data-back="{back_path}"
                    data-in="{in_path}"
                    onclick="mostrarInfo(this)"
                ><br>
                <span>{titulo}<br> <strong>${precio}</strong></span><br>
                <button onclick="agregarAlCarrito('{titulo}', {precio})">Añadir</button>
            </div>
        </div>
        '''

    productos_html += "\n  </div>\n"

    # Solo añadir botón si hay más de 3 productos
    if len(grupo) > 3:
        productos_html += '  <div class="ver-mas-container"><button class="ver-mas" onclick="toggleCategoria(this)">Ver más</button></div>\n'

    productos_html += "</div>\n"

# Leer index.html
with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Script JS para manejar ver más/menos
script_js = """
<style>
.ver-mas-container {
  text-align: center;
  margin-top: 15px;
}
.ver-mas {
  padding: 8px 16px;
  background-color: #444;
  color: #fff;
  border: none;
  cursor: pointer;
}
.ver-mas:hover {
  background-color: #666;
}
</style>
<script>
function toggleCategoria(boton) {
  const categoriaDiv = boton.closest('.categoria');
  const hiddenItems = categoriaDiv.querySelectorAll('.hidden-item');
  const expanded = boton.getAttribute('data-expanded') === 'true';
  hiddenItems.forEach(item => {
    item.style.display = expanded ? 'none' : 'block';
  });
  boton.textContent = expanded ? 'Ver más' : 'Ver menos';
  boton.setAttribute('data-expanded', expanded ? 'false' : 'true');
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hidden-item').forEach(item => {
    item.style.display = 'none';
  });
});
</script>
"""

new_content = re.sub(
    r'<!-- INICIO -->.*?<!-- FIN -->',
    f'<!-- INICIO -->\n{productos_html}{script_js}\n<!-- FIN -->',
    index_content,
    flags=re.DOTALL
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Catálogo actualizado: 3 ítems visibles por categoría, botón centrado 'Ver más' solo si corresponde.")
