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
    # Normaliza acentos
    s = unicodedata.normalize("NFD", s)
    s = s.encode("ascii", "ignore").decode("utf-8")
    # Reglas específicas
    s = s.replace(":", "_")            # unifica ":" -> "_"
    s = s.replace(" ", "_")            # espacios -> "_"
    s = re.sub(r"[¿?]", "", s)         # elimina signos de pregunta
    # Resto de no alfanumérico -> "_"
    s = re.sub(r"[^a-zA-Z0-9_]", "_", s)
    # Colapsa múltiples "_"
    s = re.sub(r"_+", "_", s)
    return s.strip("_").lower()

# Carpeta de imágenes y logo placeholder 
img_folder = "img"
logo_placeholder = "agua_sabajo_logo.png"  # está en la raíz

# Cargar el archivo XLS
df = pd.read_excel('LIBRERÍA_AGUAS_ABAJO.xlsx')


# Seleccionar columnas necesarias y manejar NaN
df = df[['TÍTULO', 'AUTOR', 'AÑO', 'ISBN', 'EDITORIAL', 'RESUMEN', 'PRECIO VENTA', 'CATEGORIA', 'DIMENSIONES']].fillna({
    'ISBN': "No disponible",
    'AÑO': "No disponible",
    'RESUMEN': "No disponible",
    'CATEGORIA': "Sin categoría",
    'DIMENSIONES': "No disponible"
})


productos_html = ''

# Agrupar por categoría
for categoria, grupo in df.groupby("CATEGORIA"):
    categoria_id = slugify(categoria)
    productos_html += f'\n<div class="categoria" id="{categoria_id}">\n  <h2>{esc(categoria)}</h2>\n  <div class="row">\n'

    for _, row in grupo.iterrows():
        # Escapar textos
        titulo = esc(row['TÍTULO'])
        autor = esc(row['AUTOR'])
        editorial = esc(row['EDITORIAL'])
        resumen = esc(row['RESUMEN'])
        isbn = esc(row['ISBN'])

        # Año robusto
        if row['AÑO'] == "No disponible":
            año = "No disponible"
        else:
            try:
                año = str(int(float(row['AÑO'])))
            except Exception:
                año = esc(row['AÑO'])

        # Precio robusto
        try:
            precio = int(float(row['PRECIO VENTA']))
        except Exception:
            precio = 0

        # Slug seguro para nombres de archivo
        titulo_slug = slugify(row['TÍTULO'])
        print(titulo_slug)

        # Rutas de imágenes esperadas
        cover_path = f"{img_folder}/{titulo_slug}_cover.jpg"
        back_path  = f"{img_folder}/{titulo_slug}_back.jpg"
        in_path    = f"{img_folder}/{titulo_slug}_in.jpg"

        # Si no existen, usar logo como placeholder
        if not os.path.exists(cover_path):
            cover_path = logo_placeholder
        if not os.path.exists(back_path):
            back_path = logo_placeholder
        if not os.path.exists(in_path):
            in_path = logo_placeholder

        dimensiones = esc(row['DIMENSIONES'])

        # Generar HTML para cada producto con data-attributes
        productos_html += f'''
        <div class="col-md-4">
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


    productos_html += "\n  </div>\n</div>\n"

# Leer index.html
with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Reemplazar bloque entre <!-- INICIO --> y <!-- FIN -->
new_content = re.sub(
    r'<!-- INICIO -->.*?<!-- FIN -->',
    f'<!-- INICIO -->\n{productos_html}<!-- FIN -->',
    index_content,
    flags=re.DOTALL
)

# Guardar index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("El contenido del catálogo en index.html ha sido actualizado y agrupado por categorías ✅")
