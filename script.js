/* ============================
   Variables globales
============================ */
let images = [];
let currentIndex = 0;
let carrito = [];
let total = 0;

/* ============================
   Carrito de compras
============================ */
function agregarAlCarrito(nombre, precio) {
    const itemExistente = carrito.find(item => item.nombre === nombre);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    total += precio;
    actualizarCarrito();
}

function eliminarDelCarrito(nombre) {
    const itemIndex = carrito.findIndex(item => item.nombre === nombre);

    if (itemIndex !== -1) {
        total -= carrito[itemIndex].precio;
        if (carrito[itemIndex].cantidad > 1) {
            carrito[itemIndex].cantidad--;
        } else {
            carrito.splice(itemIndex, 1);
        }
        actualizarCarrito();
    }
}

function actualizarCarrito() {
    const lista = document.getElementById("listaCarrito");
    const totalElemento = document.getElementById("total");
    const carritoTexto = [];

    lista.innerHTML = "";

    carrito.forEach(item => {
        const li = document.createElement("li");
        li.classList.add("cart-item");
        li.innerHTML = `
          <span>${item.nombre} - CLP ${item.precio} (Cantidad: ${item.cantidad})</span>
          <button onclick="eliminarDelCarrito('${item.nombre}')">🗑️</button>
        `;
        lista.appendChild(li);

        carritoTexto.push(`${item.nombre} - CLP ${item.precio} (Cantidad: ${item.cantidad})`);
    });

    // Actualiza el total visible en el modal
    totalElemento.textContent = total;

    // Actualiza también el formulario de contacto
    document.getElementById("totalVisible").textContent = total;
    document.getElementById("detalleVisible").innerHTML = carritoTexto.join('<br>');
    document.getElementById("carrito").value = carritoTexto.join(', ');
    document.getElementById("detallesPedido").value = carritoTexto.join('\n');
    document.getElementById("totalPedido").value = total;

    // 👇 Actualiza el badge del botón flotante
    document.getElementById("cart-count").textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

/* ============================
   Modal de producto
============================ */
function mostrarInfo(el) {
    const d = el.dataset;

    // Imagen principal
    document.getElementById('imgModal').src = d.cover;

    // Info textual
    document.getElementById('modalAuthor').textContent = "Autor: " + d.autor;
    document.getElementById('modalYear').textContent = "Año: " + d.anio;
    document.getElementById('modalISBN').textContent = "ISBN: " + d.isbn;
    document.getElementById('modalEditorial').textContent = "Editorial: " + d.editorial;
    document.getElementById("modalDimensiones").textContent = "Dimensiones: " + d.dimensiones;
    document.getElementById('modalDescription').textContent = d.resumen;
    document.getElementById('modalPrice').textContent = "Precio: $" + d.precio;

    // Navegación de imágenes
    images = [d.cover, d.back, d.in].filter(src => src && src !== "");
    currentIndex = 0;

    checkButtons();
    document.getElementById('prevBtn').onclick = prevImage;
    document.getElementById('nextBtn').onclick = nextImage;

    // Mostrar modal con Bootstrap 5 (sin jQuery)
    const modalElement = document.getElementById('imageModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function updateModalImage() {
    document.getElementById('imgModal').src = images[currentIndex];
    checkButtons();
}

function prevImage() {
    if (currentIndex > 0) {
        currentIndex--;
        updateModalImage();
    }
}

function nextImage() {
    if (currentIndex < images.length - 1) {
        currentIndex++;
        updateModalImage();
    }
}

function checkButtons() {
    document.getElementById('prevBtn').style.display = currentIndex === 0 ? 'none' : 'inline';
    document.getElementById('nextBtn').style.display = currentIndex === images.length - 1 ? 'none' : 'inline';
}

/* ============================
   Formulario de contacto con EmailJS
============================ */
// Inicializa EmailJS (pon tu PUBLIC_KEY aquí)
(function(){
    emailjs.init({ publicKey: "ds5KnZTHJ1_yDQF0W" });
})();

document.getElementById('formContacto').addEventListener('submit', function(event) {
    event.preventDefault();

    emailjs.sendForm('service_vp6o8jw', 'template_jqjt34n', this)
      .then(() => {
        alert('Formulario enviado 🎉. ¡Gracias por tu pedido! Recibirás un correo con detalles de pago y opciones de envío.');
        this.reset();
        carrito = [];
        total = 0;
        actualizarCarrito();
      }, (error) => {
        alert('Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.');
        console.error('Error:', error);
      });
});

/* ============================
   Scroll suave a contacto
============================ */
function scrollToContacto() {
    document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
}

/* ============================
   Modal del carrito
============================ */
// Referencias
const cartButton = document.getElementById('cart-button');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartCount = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');

// Abrir modal
cartButton.addEventListener('click', () => {
  cartModal.style.display = 'block';
});

// Cerrar modal
closeCart.addEventListener('click', () => {
  cartModal.style.display = 'none';
});

// Cerrar al hacer clic fuera
window.addEventListener('click', (event) => {
  if (event.target === cartModal) {
    cartModal.style.display = 'none';
  }
});

// Botón de finalizar compra → scroll al formulario
checkoutBtn.addEventListener('click', () => {
  cartModal.style.display = 'none';
  scrollToContacto();
});

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;

  // Crear botón flotante de tema si no existe
  let toggle = document.getElementById("theme-toggle");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.id = "theme-toggle";
    toggle.className = "theme-float-btn";
    toggle.textContent = "🌙 Modo oscuro";
    document.body.appendChild(toggle);
  }

  // Cargar preferencia guardada
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    root.setAttribute("data-theme", savedTheme);
    toggle.textContent = savedTheme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro";
  } else {
    root.setAttribute("data-theme", "light");
  }

  // Alternar tema
  toggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
    toggle.textContent = currentTheme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro";
  });
});

