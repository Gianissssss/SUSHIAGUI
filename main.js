/* Sushi Agüi — interacciones del sitio
   Carrito y checkout de demostración. No procesa pagos reales ni almacena datos.
*/
document.addEventListener("DOMContentLoaded", () => {
  const cart = new Map();
  const cartList = document.getElementById("cartItemList");
  const cartCount = document.getElementById("cartItemCount");
  const totalLabel = document.getElementById("totalFinal");
  const cartModalElement = document.getElementById("exampleModal");
  const paymentModalElement = document.getElementById("myModal");
  const paymentForm = document.getElementById("paymentForm");

  const cartModal = window.bootstrap?.Modal.getOrCreateInstance(cartModalElement);
  const paymentModal = window.bootstrap?.Modal.getOrCreateInstance(paymentModalElement);

  const money = value => new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

  const getPrice = text => {
    const normalized = text.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const value = Number.parseFloat(normalized);
    return Number.isFinite(value) ? value : 0;
  };

  function renderCart() {
    cartList.replaceChildren();
    let total = 0;
    let quantityTotal = 0;

    cart.forEach((product, key) => {
      const subtotal = product.price * product.quantity;
      total += subtotal;
      quantityTotal += product.quantity;

      const li = document.createElement("li");
      li.className = "cart-item";
      li.dataset.key = key;

      const image = document.createElement("img");
      image.src = product.image;
      image.alt = product.title;
      image.className = "cart-item-img rounded-circle";
      image.width = 50;
      image.height = 50;

      const details = document.createElement("div");
      details.className = "cart-item-details";

      const title = document.createElement("strong");
      title.className = "cart-item-title";
      title.textContent = product.title;

      const quantity = document.createElement("span");
      quantity.className = "cart-item-quantity";
      quantity.textContent = `Cantidad: ${product.quantity}`;

      const subtotalLabel = document.createElement("span");
      subtotalLabel.className = "cart-item-price";
      subtotalLabel.textContent = `Subtotal: $${money(subtotal)}`;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn-sm btn-outline-danger remove-cart-item";
      remove.dataset.key = key;
      remove.textContent = "Quitar";

      details.append(title, quantity, subtotalLabel, remove);
      li.append(image, details);
      cartList.append(li);
    });

    cartCount.textContent = quantityTotal;
    totalLabel.textContent = `TOTAL: $${money(total)}`;

    const payButton = document.getElementById("btn-pagar");
    if (payButton) payButton.disabled = quantityTotal === 0;
  }

  document.addEventListener("click", event => {
    const counterButton = event.target.closest(".counter-btn");
    if (counterButton) {
      const counter = counterButton.parentElement.querySelector(".counter");
      const current = Number.parseInt(counter.textContent, 10) || 0;
      const change = counterButton.textContent.trim() === "+" ? 1 : -1;
      counter.textContent = Math.max(0, current + change);
      return;
    }

    const addButton = event.target.closest(".menu-btn-carro");
    if (addButton) {
      const card = addButton.closest(".menu-card");
      const counter = card.querySelector(".counter");
      const quantity = Number.parseInt(counter.textContent, 10) || 0;

      if (quantity < 1) {
        showNotification("Elegí una cantidad antes de agregar el producto.");
        return;
      }

      const title = card.querySelector(".item-title").textContent.trim();
      const priceText = card.querySelector(".item-price").textContent;
      const image = card.querySelector(".item-img").getAttribute("src");
      const price = getPrice(priceText);
      const key = title.toLocaleLowerCase("es");

      if (cart.has(key)) {
        cart.get(key).quantity += quantity;
      } else {
        cart.set(key, { title, price, image, quantity });
      }

      counter.textContent = "0";
      renderCart();
      showNotification("Producto agregado al carrito.");
      return;
    }

    const removeButton = event.target.closest(".remove-cart-item");
    if (removeButton) {
      cart.delete(removeButton.dataset.key);
      renderCart();
    }
  });

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.setAttribute("role", "status");
    notification.textContent = message;
    document.body.append(notification);
    window.setTimeout(() => notification.remove(), 2600);
  }

  document.getElementById("btn-pagar")?.addEventListener("click", () => {
    if (cart.size === 0) return;
    if (cartModalElement && paymentModalElement) {
      cartModalElement.addEventListener("hidden.bs.modal", () => paymentModal?.show(), { once: true });
      cartModal?.hide();
    } else {
      paymentModal?.show();
    }
  });

  document.getElementById("cerrarBtn")?.addEventListener("click", () => {
    paymentModal?.hide();
  });

  paymentForm?.addEventListener("submit", event => {
    event.preventDefault();
    if (!paymentForm.reportValidity()) return;
    if (cart.size === 0) {
      showNotification("El carrito está vacío.");
      paymentModal?.hide();
      return;
    }

    // Checkout demostrativo: no se realiza ningún cobro ni se envían datos.
    showNotification("Pedido de demostración registrado. No se realizó ningún pago.");
    paymentForm.reset();
    cart.clear();
    document.querySelectorAll(".menu-card .counter").forEach(counter => {
      counter.textContent = "0";
    });
    renderCart();
    paymentModal?.hide();
  });

  document.getElementById("myForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const email = document.getElementById("myInput");
    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }
    showNotification("Formulario de demostración: todavía no hay un servicio de suscripción conectado.");
    event.currentTarget.reset();
  });

  renderCart();

 
});
