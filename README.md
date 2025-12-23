# Mercado de Proximidad

MVP de marketplace local con Node/Express + MySQL y frontend en Vue 3. Permite buscar productos por zona, gestionar reservas con vendedores/compradores, chat offline por reserva y valoraciones finales.

## Stack
- Backend: Node.js, Express (ESM), mysql2/promise, JWT.
- Frontend: Vue 3 + Vite (sin router pesado), Leaflet por CDN.
- Infra: Docker Compose + MySQL 8 + Nginx para estáticos.

## Esquema de datos
Fuente de verdad: `db/init.sql`. Tablas usadas: usuarios, categorias, productos, puntos_entrega, reservas, mensajes, valoraciones (y notificaciones sembrada pero no usada). Usuarios de seed tienen contraseña en texto plano.

## Ejecutar con Docker
```bash
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up --build
```
- Frontend: http://localhost:8080
- Backend health: http://localhost:3000/api/health y /api/health/db

## Credenciales demo (seed de db/init.sql)
- Admin: admin@demo.local / admin123
- Vendedor: vendedor@demo.local / vendedor123
- Comprador: comprador@demo.local / comprador123

## Funcionalidad clave
- Login JWT (Bearer). Logout solo borra token en cliente.
- Productos: CRUD vendedor, filtro por texto/categoría y por zona (usa lat/lng del vendedor y sus puntos de entrega con Haversine en backend).
- Reservas: comprador crea; vendedor gestiona estados (pendiente/aceptada/rechazada/cancelada/completada). Al aceptar, se descuenta stock si hay suficiente.
- Chat offline: mensajes ligados a reserva; se guarda autor dentro del campo `mensaje` como JSON `{author,text}` para mantener compatibilidad con el esquema existente (el seed en texto plano se muestra como mensaje del comprador).
- Valoraciones: disponibles para reservas en estado `completada`, sin duplicar autor por reserva.

## Configuración Frontend
- `VITE_API_URL` opcional (por defecto `http://localhost:3000`). El build se sirve con Nginx dentro del contenedor.

## Notas de zona y filtrado
- Coordenadas usadas: lat/lng de `usuarios` (vendedor) y `puntos_entrega`. Se calcula la distancia mínima a cualquiera de ellos para filtrar por radio (15 km por defecto desde el selector).
