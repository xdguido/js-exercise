/*
En el archivo tarea2.js podemos encontrar un código de un supermercado que vende productos.
El código contiene 
    - una clase Producto que representa un producto que vende el super
    - una clase Carrito que representa el carrito de compras de un cliente
    - una clase ProductoEnCarrito que representa un producto que se agrego al carrito
    - una función findProductBySku que simula una base de datos y busca un producto por su sku
El código tiene errores y varias cosas para mejorar / agregar
​
Ejercicios
1) Arreglar errores existentes en el código
    a) Al ejecutar agregarProducto 2 veces con los mismos valores debería agregar 1 solo producto con la suma de las cantidades.    
    b) Al ejecutar agregarProducto debería actualizar la lista de categorías solamente si la categoría no estaba en la lista.
    c) Si intento agregar un producto que no existe debería mostrar un mensaje de error.
​
2) Agregar la función eliminarProducto a la clase Carrito
    a) La función eliminarProducto recibe un sku y una cantidad (debe devolver una promesa)
    b) Si la cantidad es menor a la cantidad de ese producto en el carrito, se debe restar esa cantidad al producto
    c) Si la cantidad es mayor o igual a la cantidad de ese producto en el carrito, se debe eliminar el producto del carrito
    d) Si el producto no existe en el carrito, se debe mostrar un mensaje de error
    e) La función debe retornar una promesa
​
3) Utilizar la función eliminarProducto utilizando .then() y .catch()
​
*/

// Cada producto que vende el super es creado con esta clase
class Producto {
    sku; // Identificador único del producto
    nombre; // Su nombre
    categoria; // Categoría a la que pertenece este producto
    precio; // Su precio
    stock; // Cantidad disponible en stock

    constructor(sku, nombre, precio, categoria, stock) {
        this.sku = sku;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;

        // Si no me definen stock, pongo 10 por default
        if (stock) {
            this.stock = stock;
        } else {
            this.stock = 10;
        }
    }
}

// Creo todos los productos que vende mi super
const queso = new Producto('KS944RUR', 'Queso', 10, 'lacteos', 4);
const gaseosa = new Producto('FN312PPE', 'Gaseosa', 5, 'bebidas');
const cerveza = new Producto('PV332MJ', 'Cerveza', 20, 'bebidas');
const arroz = new Producto('XX92LKI', 'Arroz', 7, 'alimentos', 20);
const fideos = new Producto('UI999TY', 'Fideos', 5, 'alimentos');
const lavandina = new Producto('RT324GD', 'Lavandina', 9, 'limpieza');
const shampoo = new Producto('OL883YE', 'Shampoo', 3, 'higiene', 50);
const jabon = new Producto('WE328NJ', 'Jabon', 4, 'higiene', 3);

// Genero un listado de productos. Simulando base de datos
const productosDelSuper = [queso, gaseosa, cerveza, arroz, fideos, lavandina, shampoo, jabon];

// Cada cliente que venga a mi super va a crear un carrito
class Carrito {
    productos; // Lista de productos agregados
    categorias; // Lista de las diferentes categorías de los productos en el carrito
    precioTotal; // Lo que voy a pagar al finalizar mi compra

    // Al crear un carrito, empieza vació
    constructor() {
        this.precioTotal = 0;
        this.productos = [];
        this.categorias = [];
    }

    /**
     * función que agrega @{cantidad} de productos con @{sku} al carrito
     */
    async agregarProducto(sku, cantidad) {
        console.log(`Agregando ${cantidad} ${sku}`);

        // buscar en db. necesario para consultar precio o crear producto nuevo en el carrito
        findProductBySku(sku)
            .then((producto) => {
                console.log('Producto encontrado', producto);
                // buscar en el carrito
                const productIndex = this.productos.findIndex((product) => product.sku === sku);
                // crear copia del producto. approach para evitar mutacion
                const updatedProduct = { ...this.productos[productIndex] };
                // crear copia del carrito con el producto
                const updatedProductsInCart = [...this.productos];

                // el producto existe en el carrito
                if (productIndex !== -1) {
                    // actualizar cantidad del producto
                    updatedProduct.cantidad += cantidad;
                    updatedProductsInCart[productIndex] = updatedProduct;

                    this.productos = updatedProductsInCart;
                    this.precioTotal = this.precioTotal + producto.precio * cantidad;
                    console.log('Producto actualizado con exito', updatedProduct);
                    console.log('Nuevo carrito: ' + JSON.stringify(this.productos));
                } else {
                    // crear un producto nuevo
                    const nuevoProducto = new ProductoEnCarrito(sku, producto.nombre, cantidad);
                    updatedProductsInCart.push(nuevoProducto);
                    // agregar categoria
                    const updatedCategories = [...this.categorias];
                    const isCategoryInCart = updatedCategories.some(
                        (categoria) => categoria === producto.categoria
                    );
                    if (!isCategoryInCart) {
                        updatedCategories.push(producto.categoria);
                    }

                    this.productos = updatedProductsInCart;
                    this.categorias = updatedCategories;
                    this.precioTotal = this.precioTotal + producto.precio * cantidad;
                    console.log('Producto creado con exito', nuevoProducto);
                    console.log('Nuevo carrito: ' + JSON.stringify(this.productos));
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * función que elimina @{cantidad} de productos con @{sku} del carrito
     */
    eliminarProducto(sku, cantidad) {
        return new Promise((resolve, reject) => {
            findProductBySku(sku)
                .then((producto) => {
                    // buscar en el carrito
                    const productIndex = this.productos.findIndex((product) => product.sku === sku);
                    // el producto existe en el carrito
                    if (productIndex !== -1) {
                        // crear copia del producto. approach para evitar mutacion
                        const updatedProduct = { ...this.productos[productIndex] };
                        // actualizar cantidad del producto
                        updatedProduct.cantidad -= cantidad;
                        // crear copia del carrito con el producto actualizado
                        const updatedProductsInCart = [...this.productos];
                        const previousAmount = this.productos[productIndex].cantidad;

                        if (updatedProduct.cantidad > 0) {
                            // actualizar cantidad del producto
                            this.precioTotal = this.precioTotal - producto.precio * cantidad;

                            updatedProductsInCart[productIndex] = updatedProduct;
                            this.productos = updatedProductsInCart;

                            console.log('Producto actualizado con exito', updatedProduct);
                            resolve(updatedProductsInCart);
                        } else {
                            // eliminar el producto del carrito
                            this.precioTotal = this.precioTotal - producto.precio * previousAmount;

                            updatedProductsInCart.filter((product) => product.sku !== sku);

                            // remover categoria
                            const updatedCategories = [...this.categorias];
                            const keepCategory = updatedProductsInCart.some(
                                (product) => product.categoria === producto.categoria
                            );
                            if (!keepCategory) {
                                updatedCategories.filter(
                                    (categorias) => categorias !== producto.categoria
                                );
                            }
                            this.productos = updatedProductsInCart;
                            this.categorias = updatedCategories;
                            console.log('Producto eliminado con exito', updatedProduct.sku);
                            resolve(updatedProductsInCart);
                        }
                    } else {
                        reject(`Product ${sku} not found in Cart`);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}

// Cada producto que se agrega al carrito es creado con esta clase
class ProductoEnCarrito {
    sku; // Identificador único del producto
    nombre; // Su nombre
    cantidad; // Cantidad de este producto en el carrito

    constructor(sku, nombre, cantidad) {
        this.sku = sku;
        this.nombre = nombre;
        this.cantidad = cantidad;
    }
}

// Función que busca un producto por su sku en "la base de datos"
function findProductBySku(sku) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const foundProduct = productosDelSuper.find((product) => product.sku === sku);
            if (foundProduct) {
                resolve(foundProduct);
            } else {
                reject(`Product ${sku} not found in DB`);
            }
        }, 1500);
    });
}

// crea instancia del carrito
const carrito = new Carrito();
// crea nuevo producto en el carrito
carrito.agregarProducto('WE328NJ', 2);
// actualiza la cantidad del producto en el carrito
carrito.agregarProducto('WE328NJ', 4);
// error. no se encuentra el product en la base de datos
carrito.agregarProducto('WE328NJdummy', 2);
// reduce la cantidad del producto en 2
carrito
    .eliminarProducto('WE328NJ', 2)
    .then((cart) => {
        console.log('Nuevo carrito:' + JSON.stringify(cart));
    })
    .catch((err) => console.log(err));
// elimina el producto del carrito
carrito
    .eliminarProducto('WE328NJ', 20)
    .then((cart) => {
        console.log('Nuevo carrito:' + JSON.stringify(cart));
    })
    .catch((err) => console.log(err));
// error. no se encuentra el producto en el carrito
carrito
    .eliminarProducto('KS944RUR', 2)
    .then((cart) => {
        console.log('Nuevo carrito:' + JSON.stringify(cart));
    })
    .catch((err) => console.log(err));
// error. no se encuentra el producto en la base de datos
carrito
    .eliminarProducto('WE328NJdummy', 2)
    .then((cart) => {
        console.log('Nuevo carrito:' + JSON.stringify(cart));
    })
    .catch((err) => console.log(err));
