let carritoVisible = false;

const url = 'https://google-translate1.p.rapidapi.com/language/translate/v2/detect';
const options = {
  method: 'POST',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
	'Accept-Encoding': 'application/gzip',
	'X-RapidAPI-Key': '1098df8ddfmshf2f0ce45522feebp182f95jsna7527888ecb0',
	'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
  },
  body: new URLSearchParams({
    q: 'English is hard, but detectably so'
  })
};
//El uso de esta API esta limitada pero funciona correctamente.
function detectarIdioma() {
    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then(response => response.json())
        .then(data => {
          if (data && data.data && data.data.detections && data.data.detections.length > 0) {
            const idiomaDetectado = data.data.detections[0][0].language;
            resolve(idiomaDetectado);
          } else {
            reject(new Error('Respuesta de la API inválida')); 
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  detectarIdioma()
    .then(idioma => {
      console.log(`El idioma detectado es: ${idioma}`);
    })
    .catch(error => {
      console.error('Error:', error);
    });

detectarIdioma();

function getCarritoFromLocalStorage() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
}

if(document.readyState == 'loading'){
    document.addEventListener('DOMContentLoaded', ready)
}else{
    ready();
}

function ready(){
    let botonesEliminarItem = document.getElementsByClassName('btn-eliminar');
    for(let i=0;i<botonesEliminarItem.length; i++){
        let button = botonesEliminarItem[i];
        button.addEventListener('click',eliminarItemCarrito);
    }
    let botonesSumarCantidad = document.getElementsByClassName('sumar-cantidad');
    for(let i=0;i<botonesSumarCantidad.length; i++){
        let button = botonesSumarCantidad[i];
        button.addEventListener('click',sumarCantidad);
    }
    let botonesRestarCantidad = document.getElementsByClassName('restar-cantidad');
    for(let i=0;i<botonesRestarCantidad.length; i++){
        let button = botonesRestarCantidad[i];
        button.addEventListener('click',restarCantidad);
    }
    let botonesAgregarAlCarrito = document.getElementsByClassName('boton-item');
    for(let i=0; i<botonesAgregarAlCarrito.length;i++){
        let button = botonesAgregarAlCarrito[i];
        button.addEventListener('click', agregarAlCarritoClicked);
    }
    let carritoEnStorage = getCarritoFromLocalStorage();
    carritoEnStorage.forEach((item) => {
        agregarItemAlCarrito(item.titulo, item.precio, item.imagenSrc);
    });
    document.getElementsByClassName('btn-pagar')[0].addEventListener('click',pagarClicked);
}

function pagarClicked() {
    Swal.fire({
      title: '¡Gracias por tu compra! 🛍️🌟',
      html: `
        <p>Vamos a preparar tu pedido con mucho cariño.</p>
      `,
      icon: 'success',
      confirmButtonText: '¡Gracias! 😊',
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('carrito');
        actualizarTotalCarrito();
        ocultarCarrito();
        
        window.location.href = 'index.html';
      }
    });
  }

function agregarAlCarritoClicked(event){
    let button = event.target;
    let item = button.parentElement;
    let titulo = item.getElementsByClassName('titulo-item')[0].innerText;
    let precio = item.getElementsByClassName('precio-item')[0].innerText;
    let imagenSrc = item.getElementsByClassName('img-item')[0].src;
    console.log(imagenSrc);

    agregarItemAlCarrito(titulo, precio, imagenSrc);

    hacerVisibleCarrito();
}

function hacerVisibleCarrito(){
    carritoVisible = true;
    let carrito = document.getElementsByClassName('carrito')[0];
    carrito.style.marginRight = '0';
    carrito.style.opacity = '1';
    let items =document.getElementsByClassName('contenedor-items')[0];
    items.style.width = '60%';
}

function agregarItemAlCarrito(titulo, precio, imagenSrc) {
    let item = document.createElement('div');
    item.classList.add('item');
    let itemsCarrito = document.getElementsByClassName('carrito-items')[0];
    let nombresItemsCarrito = itemsCarrito.getElementsByClassName('carrito-item-titulo');
    for (let i = 0; i < nombresItemsCarrito.length; i++) {
      if (nombresItemsCarrito[i].innerText === titulo) {
        Swal.fire({
          icon: 'info',
          title: 'El artículo ya está en el carrito!',
          confirmButtonText: 'Entendido!',
          confirmButtonColor: '#3085d6',
        });
        return;
      }
    }
  
    let carritoEnStorage = getCarritoFromLocalStorage();
    carritoEnStorage.push({ titulo, precio, imagenSrc });
    localStorage.setItem('carrito', JSON.stringify(carritoEnStorage));
    Swal.fire({
      iconHtml: '<i class="bi bi-currency-dollar"></i>',
      title: '¡Artículo agregado al carrito!',
      text: '¡Disfruta de tu compra!',
      confirmButtonText: '¡Genial!',
      confirmButtonColor: '#3085d6',
    });

    let itemCarritoContenido = `
        <div class="carrito-item">
            <img src="${imagenSrc}" width="80px" alt="">
            <div class="carrito-item-detalles">
                <span class="carrito-item-titulo">${titulo}</span>
                <div class="selector-cantidad">
                    <i class="fa-solid fa-minus restar-cantidad"></i>
                    <input type="text" value="1" class="carrito-item-cantidad" disabled>
                    <i class="fa-solid fa-plus sumar-cantidad"></i>
                </div>
                <span class="carrito-item-precio">${precio}</span>
            </div>
            <button class="btn-eliminar">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `
    item.innerHTML = itemCarritoContenido;
    itemsCarrito.append(item);
     item.getElementsByClassName('btn-eliminar')[0].addEventListener('click', eliminarItemCarrito);
    let botonRestarCantidad = item.getElementsByClassName('restar-cantidad')[0];
    botonRestarCantidad.addEventListener('click',restarCantidad);

    let botonSumarCantidad = item.getElementsByClassName('sumar-cantidad')[0];
    botonSumarCantidad.addEventListener('click',sumarCantidad);

    actualizarTotalCarrito();
}

function actualizarCantidad(event, operacion) {
    let buttonClicked = event.target;
    let selector = buttonClicked.parentElement;
    let cantidadActual = parseInt(selector.getElementsByClassName('carrito-item-cantidad')[0].value);
    if (operacion === 'sumar') {
        cantidadActual++;
    }else if (operacion === 'restar') {
        cantidadActual--;
        if (cantidadActual < 1) {
            cantidadActual = 1;
        }
    }
    selector.getElementsByClassName('carrito-item-cantidad')[0].value = cantidadActual;
    actualizarTotalCarrito();
}

function sumarCantidad(event) {
    actualizarCantidad(event, 'sumar');
}

function restarCantidad(event) {
    actualizarCantidad(event, 'restar');
}

function eliminarItemCarrito(event){
    let buttonClicked = event.target;
    let titulo = buttonClicked.parentElement.parentElement.querySelector('.carrito-item-titulo').innerText;
    buttonClicked.parentElement.parentElement.remove();
    actualizarTotalCarrito();
    ocultarCarrito();
    let carritoEnStorage = getCarritoFromLocalStorage();
    carritoEnStorage = carritoEnStorage.filter((item) => item.titulo !== titulo);
    localStorage.setItem('carrito', JSON.stringify(carritoEnStorage));
}

function ocultarCarrito(){
    let carritoItems = document.getElementsByClassName('carrito-items')[0];
    if(carritoItems.childElementCount==0){
        let carrito = document.getElementsByClassName('carrito')[0];
        carrito.style.marginRight = '-100%';
        carrito.style.opacity = '0';
        carritoVisible = false;
    
        let items =document.getElementsByClassName('contenedor-items')[0];
        items.style.width = '100%';
    }
}

function actualizarTotalCarrito(){
    let carritoContenedor = document.getElementsByClassName('carrito')[0];
    let carritoItems = carritoContenedor.getElementsByClassName('carrito-item');
    let total = 0;
    for(let i=0; i< carritoItems.length;i++){
        let item = carritoItems[i];
        let precioElemento = item.getElementsByClassName('carrito-item-precio')[0];
        let precio = parseFloat(precioElemento.innerText.replace('$','').replace('.',''));
        let cantidadItem = item.getElementsByClassName('carrito-item-cantidad')[0];
        console.log(precio);
        let cantidad = cantidadItem.value;
        total = total + (precio * cantidad);
    }
    total = Math.round(total * 100)/100;

    document.getElementsByClassName('carrito-precio-total')[0].innerText = '$'+total.toLocaleString("es") + ",00";

}
