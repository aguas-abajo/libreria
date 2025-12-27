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
        li.textContent = `${item.nombre} - CLP ${item.precio} (Cantidad: ${item.cantidad}) `;

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";
        botonEliminar.onclick = () => eliminarDelCarrito(item.nombre);
        li.appendChild(botonEliminar);

        lista.appendChild(li);

        carritoTexto.push(`${item.nombre} - CLP ${item.precio} (Cantidad: ${item.cantidad})`);
    });

    // Actualiza el total visible
    totalElemento.textContent = total;
    document.getElementById("totalVisible").textContent = total;

    // 👇 Aquí actualizamos el detalle visible en el formulario
    document.getElementById("detalleVisible").innerHTML = carritoTexto.join('<br>');

    // Actualiza los campos ocultos para EmailJS
    document.getElementById("carrito").value = carritoTexto.join(', ');
    document.getElementById("detallesPedido").value = carritoTexto.join('\n');
    document.getElementById("totalPedido").value = total;
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

