---
## Cambios recientes importantes (enero 2026)

- Se integraron las carpetas `backend` y `control-gym` directamente al repositorio principal, eliminando su gestión como submódulos o repositorios independientes.
  - Ahora todo el código del backend y frontend está versionado y gestionado desde este repositorio principal.
  - Se eliminaron las carpetas `.git` internas de ambos proyectos y se realizó un commit global para incluir todos los archivos.
- A partir de ahora, toda la documentación, configuración y registro de trabajo del proyecto se centraliza en este archivo `StructureProject.md`.
---

## Mejoras futuras

- Exportación avanzada de datos: filtros, formatos personalizados, integración con Google Sheets, exportación masiva, etc.

# Proyecto SaaS Membresías para Gimnasios

## Stack Tecnológico

- **Frontend:** React Native + Expo + TypeScript + Zustand
- **Backend:** Node.js + Express + MongoDB + TypeScript
- **Gestor de estado:** Zustand
- **Comunicación:** API REST

## Estructura de Carpetas

- `control-gym/` → Frontend (app móvil Expo)
- `backend/` → Backend (API REST Node.js/Express)

## Descripción General

App tipo SaaS para gestión de membresías de gimnasios. Un gimnasio puede suscribirse a un plan:

- **Básico:** hasta 100 clientes
- **Pro:** hasta 500 clientes
- **Pro+:** clientes ilimitados

El dueño del gimnasio puede:

- Acceder a dashboard admin y otras pantallas (a definir)
- Agregar, modificar y ver clientes
- Ver reportes, acceder a scanner, etc. (a implementar)

El SuperAdmin puede:

- Ver todos los gimnasios suscritos y su estado (activo/inactivo)

## Tareas Iniciales

1. Documentar stack y estructura inicial (este archivo)
2. Inicializar backend Node.js + Express + TypeScript en `backend/`
3. Configurar MongoDB y conexión en backend
4. Configurar frontend Zustand y estructura SaaS en `control-gym/`

---

**Registro de cambios y conversaciones:**
Cada cambio relevante y conversación será documentado aquí para mantener el foco y trazabilidad del proyecto.

## Registro de cambios

### 21/01/2026 (noche, parte 6)

- Se agregaron endpoints para exportar clientes en CSV y reportes en PDF (simulado).

### 21/01/2026 (noche, parte 5)

- Se agregó modelo AccessLog y endpoints para registrar accesos de clientes (QR/NFC) y consultar historial de accesos.

### 21/01/2026 (noche, parte 4)

- Se agregó endpoint para procesar pagos simulados y activar membresía automáticamente. Se registra el pago en auditoría.

### 21/01/2026 (noche, parte 3)

- Se agregó modelo AuditLog, middleware para registrar acciones y endpoint para consultar logs por SuperAdmin.

### 21/01/2026 (noche, parte 2)

- Se agregaron roles empleado y entrenador al modelo User.
- Se crearon endpoints para crear y listar empleados/entrenadores por el admin.
- Se agregó middleware para permisos granulares por rol.

### 21/01/2026 (noche)

- Se agregó modelo Payment y endpoints para registrar pagos, renovar membresía y ver historial de pagos y membresías.

### 21/01/2026 (tarde, parte 2)

- Se agregaron endpoints para recuperación y cambio de contraseña por email, con token temporal.

### 21/01/2026 (tarde)

- Se agregó endpoint para que el admin vea su membresía y plan actual.

### 21/01/2026 (mediodía)

- Se agregaron endpoints de reportes para el SuperAdmin: gimnasios activos/inactivos, membresías por plan, clientes totales y por gimnasio.

### 21/01/2026 (mañana)

- El SuperAdmin ahora puede activar/desactivar gimnasios y resetear contraseñas de admins desde la API.

### 21/01/2026

- Se implementaron endpoints para que el SuperAdmin gestione gimnasios, admins y membresías (listar, ver, editar).

### 20/01/2026 (noche, parte 2)

- Se implementó lógica para limitar la cantidad de clientes activos según el plan del gimnasio (básico: 100, pro: 500, proplus: ilimitado).

### 20/01/2026 (noche)

- Se implementó endpoint para upgrade/downgrade de plan de gimnasio, actualizando membresía y plan activo.

### 20/01/2026 (tarde)

- Se implementó endpoint para registro de gimnasio, admin y plan desde la app.
- Al registrar, se crea la membresía inicial según el plan elegido.

### 20/01/2026

- Se documentó el stack, estructura y objetivos en este archivo.
- Se inicializó el backend en `backend/` con Node.js, Express y TypeScript.
- Se configuró conexión a MongoDB y variables de entorno.
- Se creó el archivo principal `index.ts` y la conexión en `db.ts`.
- Se instalaron y configuraron los modelos User, Gym, Membership y Client en el backend.
- Se crearon endpoints CRUD protegidos para clientes, solo accesibles por admins de su propio gimnasio.
- Se creó middleware de autenticación/autorización (simulado, listo para JWT en producción).
- Se instaló y configuró Zustand en el frontend (`control-gym/`).
- Se creó un store Zustand básico para usuario (roles admin y superadmin).

---

## Endpoints CRUD implementados (enero 2026)

### Membresías (`/api/membership`)
- **GET /**: Listar membresías (admin: solo su gimnasio, superadmin: todas)
- **POST /**: Crear membresía (admin: solo su gimnasio, superadmin: cualquier gimnasio)
- **PUT /:id**: Editar membresía (admin: solo su gimnasio, superadmin: cualquier gimnasio)
- **DELETE /:id**: Eliminar membresía (admin: solo su gimnasio, superadmin: cualquier gimnasio)
- **POST /change-plan**: Cambiar plan de gimnasio (admin)

### Usuarios (`/api/users`)
- **GET /**: Listar usuarios (admin: solo su gimnasio, superadmin: todos)
- **POST /**: Crear usuario (admin: solo su gimnasio, superadmin: cualquier gimnasio)
- **PUT /:id**: Editar usuario (admin: solo su gimnasio, superadmin: cualquier gimnasio)
- **DELETE /:id**: Eliminar usuario (admin: solo su gimnasio, superadmin: cualquier gimnasio)

> Todos los endpoints requieren autenticación JWT y permisos de rol adecuados (`admin` o `superadmin`).
