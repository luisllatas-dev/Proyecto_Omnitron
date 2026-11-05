# Omnitron - Tienda Multivertical de Productos Digitales (Microservicios)

Plataforma de comercio electrónico multivertical (Cursos, Videojuegos y Software) contenerizada con **Docker**, **Node.js/Express**, **MongoDB**, **React + Vite + Tailwind CSS** y **Nginx API Gateway**.

Entrega inmediata de contenido digital mediante enlaces protegidos de **Google Drive**.

---

## 🏗️ Arquitectura del Sistema

```
                             [ Cliente / Navegador ]
                                        │
                                        ▼
                          [ API Gateway (Nginx :8080) ]
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
      [ Frontend React ]        [ Microservicios ]        [ Microservicios ]
     (SPA Vite + Tailwind)     (Auth :4001, Catalog :4002,  (Order & Payments :4003)
                                        │
                                        ▼
                               [ MongoDB (:27017) ]
```

### Componentes:
1. **Frontend (`frontend/`):**
   * SPA moderna construida con React, Vite y Tailwind CSS.
   * **Temas dinámicos:** La interfaz cambia de tema visual (colores de acento, bordes con resplandor neón, banners y títulos) según la vertical activa (Cursos = Azul tech, Videojuegos = Púrpura neón, Software = Verde esmeralda).
   * **Carrito flotante persistente:** Guarda ítems en `localStorage` y los sincroniza automáticamente al iniciar sesión.
   * **Modales interactivos:** Ficha técnica y temario completo, login/registro sin perder el carrito, checkout multiversión y panel de descargas de Google Drive.
2. **API Gateway (`gateway/`):**
   * Proxy inverso Nginx expuesto en el puerto `8080`.
   * Unifica tanto la aplicación web (`/`) como todos los endpoints de la API (`/api/*`).
3. **Auth Service (`services/auth-service/`):**
   * Registro, login y tokens JWT con roles (`client`, `admin`).
4. **Catalog Service (`services/catalog-service/`):**
   * Jerarquía de categorías (Macro-categorías principales + Subcategorías con conteo).
   * Cursos, videojuegos y software con temarios, requisitos y enlaces de Google Drive protegidos (`select: false`).
5. **Order & Payment Service (`services/order-payment-service/`):**
   * Gestión de carritos y órdenes.
   * Adaptadores para **PayPal** (internacional), **Mercado Pago** (Latinoamérica) e **IziPay** (Perú con Yape/Plin).
   * Simulador de pagos instantáneo para pruebas de desarrollo.
   * **Panel "Mis Compras":** Desbloquea los enlaces de Google Drive exclusivamente para órdenes pagadas (`PAID`).
6. **MongoDB & Mongo Express:**
   * Base de datos MongoDB en Docker con volumen persistente.
   * Visor web disponible en `http://localhost:8081`.

---

## 🔐 Credenciales del Sistema

### Administrador (Acceso completo al Panel de Administración)
* **Correo:** `admin@omnitron.com`
* **Contraseña:** `admin123456`
* *(Al iniciar sesión con esta cuenta, el sistema te redirige automáticamente al Panel de Administración).*

### Cliente de Prueba (Modo Tienda y Compras)
* **Correo:** `juan@example.com`
* **Contraseña:** `password123`
* *(O puedes registrar cualquier cuenta nueva al instante desde el modal de la web).*

---

## 🌐 Accesos Directos

* **Tienda Web Completa (Frontend + API Gateway):** [http://localhost:8080](http://localhost:8080)
* **Frontend Directo:** [http://localhost:3000](http://localhost:3000)
* **Visor Web de MongoDB (Mongo Express):** [http://localhost:8081](http://localhost:8081)

---

## 🚀 Inicio Rápido con Docker

```bash
# 1. Levantar todos los servicios en segundo plano
docker compose up -d

# 2. Poblar o restablecer catálogo de prueba (Cursos, Juegos y Software)
docker compose exec catalog-service npm run seed

# 3. Ver estado de los contenedores
docker compose ps
```

---

## 📡 Endpoints del API Gateway (`http://localhost:8080`)

### Autenticación (`/api/auth`)
* `POST /api/auth/register` - Registro de nuevo usuario `{ name, email, password }`
* `POST /api/auth/login` - Inicio de sesión `{ email, password }`
* `GET /api/auth/profile` - Perfil de usuario *(Requiere Bearer Token)*

### Catálogo de Cursos y Categorías (`/api/courses`, `/api/categories`)
* `GET /api/categories` - Listado de categorías activas con conteo de cursos (`courseCount`)
* `GET /api/categories/:idOrSlug` - Detalle de una categoría
* `POST /api/categories` - Crear nueva categoría *(Requiere rol Admin)*
* `GET /api/courses` - Catálogo público (Cursos con precio, descuento, temario y categoría populada; sin links de Drive)
* `GET /api/courses?category=slug-o-id` - Filtrar cursos por categoría
* `GET /api/courses?search=palabra` - Buscar cursos por título
* `GET /api/courses/:idOrSlug` - Detalle público de un curso
* `POST /api/courses` - Crear curso *(Requiere rol Admin)*

### Carrito (`/api/cart`) *(Requiere Bearer Token)*
* `GET /api/cart` - Obtener carrito del usuario
* `POST /api/cart/add` - Agregar curso al carrito
* `POST /api/cart/sync` - Sincronizar ítems del carrito de invitado (`localStorage`) tras loguearse
* `DELETE /api/cart/item/:courseId` - Quitar un curso del carrito
* `DELETE /api/cart` - Vaciar carrito

### Órdenes y Mis Cursos (`/api/orders`) *(Requiere Bearer Token)*
* `POST /api/orders` - Crear orden con selección de pasarela (`PAYPAL`, `MERCADOPAGO`, `IZIPAY`)
* `GET /api/orders/my-courses` - **Panel "Mis Cursos"** con los enlaces de Google Drive de los cursos pagados
* `GET /api/orders/my-orders` - Historial de compras

### Pagos y Webhooks (`/api/payments`)
* `POST /api/payments/webhook/paypal` - Webhook de confirmación de PayPal
* `POST /api/payments/webhook/mercadopago` - Webhook de notificación Mercado Pago
* `POST /api/payments/webhook/izipay` - Webhook de confirmación IziPay
* `POST /api/payments/dev-simulate-pay/:orderId` - **Simulador de pago para desarrollo** (marca la orden como pagada y desbloquea los links de Drive al instante)
