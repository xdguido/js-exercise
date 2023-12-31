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

        try {
            const producto = await findProductBySku(sku);
            const productIndex = this.productos.findIndex((product) => product.sku === sku);
            // crear copia del producto y productos en el carrito. approach para evitar mutacion
            const updatedProduct = productIndex !== -1 ? { ...this.productos[productIndex] } : null;
            const updatedProductsInCart = [...this.productos];

            if (updatedProduct) {
                // el producto existe en el carrito
                updatedProduct.cantidad += cantidad;
                updatedProductsInCart[productIndex] = updatedProduct;
            } else {
                // el producto no existe en el carrito
                const nuevoProducto = new ProductoEnCarrito(sku, producto.nombre, cantidad);
                updatedProductsInCart.push(nuevoProducto);
            }

            await this.updateCart(updatedProductsInCart);
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * función que elimina @{cantidad} de productos con @{sku} del carrito
     */
    eliminarProducto(sku, cantidad) {
        return new Promise((resolve, reject) => {
            (async () => {
                // actualizar la cantidad de producto de ser posible
                const productIndex = this.productos.findIndex((product) => product.sku === sku);
                const updatedProductInCart =
                    productIndex !== -1 ? { ...this.productos[productIndex] } : null;

                if (updatedProductInCart) {
                    updatedProductInCart.cantidad -= cantidad;
                    const updatedProductsInCart = [...this.productos];

                    if (updatedProductInCart.cantidad > 0) {
                        // si la cantidad actualizada es mayor a cero, se actualiza el producto con la nueva cantidad
                        updatedProductsInCart[productIndex] = updatedProductInCart;
                        await this.updateCart(updatedProductsInCart);
                        console.log('Producto actualizado con exito', updatedProductInCart);
                        resolve(updatedProductsInCart);
                    } else {
                        // si la cantidad actualizada es mayor a cero, eliminar el producto del carrito
                        resolve(await this.removeProductFromCart(productIndex));
                    }
                } else {
                    reject(`Product ${sku} not found in Cart`);
                }
            })();
        });
    }

    /**
     * función privada que actualiza el carrito
     */
    async updateCart(updatedProducts) {
        // actualizar el resto del carrito
        this.productos = updatedProducts;
        // actualizar precios
        await this.actualizarPrecios();
        // actualizar categorias
        this.actualizarCategorias();
        console.log('Nuevo carrito: ' + JSON.stringify(updatedProducts));
    }

    /**
     * función que elimina el producto @{sku} del carrito
     */
    async removeProductFromCart(productIndex) {
        const updatedProductsInCart = [...this.productos];
        updatedProductsInCart.splice(productIndex, 1);
        await this.updateCart(updatedProductsInCart);
        console.log('Producto eliminado con exito');
        return updatedProductsInCart;
    }

    async actualizarPrecios() {
        try {
            const productoActualizado = await Promise.all(
                this.productos.map((producto) => {
                    const { precio } = findProductBySku(producto.sku);
                    return { precio, ...producto.cantidad };
                })
            );
            const precioTotal = productoActualizado.reduce(
                (total, producto) => total + producto.precio * producto.cantidad,
                0
            );
            this.precioTotal = precioTotal;
        } catch (err) {
            console.error(err);
        }
    }

    actualizarCategorias() {
        try {
            const categoriasActualizadas = [];
            for (const producto of this.productos) {
                if (!categoriasActualizadas.includes(producto.categoria)) {
                    categoriasActualizadas.push(producto.categoria);
                }
            }
            this.categorias = categoriasActualizadas;
        } catch (err) {
            console.error(err);
        }
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
        }, 1000);
    });
}

// crea instancia del carrito
const carrito = new Carrito();
const runQueries = async () => {
    // crea nuevo producto en el carrito
    await carrito.agregarProducto('WE328NJ', 2);
    console.log('================================================');
    // actualiza la cantidad del producto en el carrito
    await carrito.agregarProducto('WE328NJ', 4);
    console.log('================================================');
    // error. no se encuentra el product en la base de datos
    await carrito.agregarProducto('WE328NJdummy', 2);
    console.log('================================================');

    // reduce la cantidad del producto en 2
    carrito
        .eliminarProducto('WE328NJ', 2)
        .then((cart) => {
            // console.log('Nuevo carrito:' + JSON.stringify(cart));
        })
        .catch((err) => console.log(err));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('================================================');

    // elimina el producto del carrito
    carrito
        .eliminarProducto('WE328NJ', 20)
        .then((cart) => {
            // console.log('Nuevo carrito:' + JSON.stringify(cart));
        })
        .catch((err) => console.log(err));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('================================================');

    // error. no se encuentra el producto en el carrito
    carrito
        .eliminarProducto('KS944RUR', 2)
        .then((cart) => {
            // console.log('Nuevo carrito:' + JSON.stringify(cart));
        })
        .catch((err) => console.log(err));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('================================================');

    // error. no se encuentra el producto en la base de datos
    carrito
        .eliminarProducto('WE328NJdummy', 2)
        .then((cart) => {
            console.log('Nuevo carrito:' + JSON.stringify(cart));
        })
        .catch((err) => console.log(err));
};
runQueries();
