---
## Cambios recientes importantes (enero 2026)

- Se integraron las carpetas `backend` y `control-gym` directamente al repositorio principal, eliminando su gestión como submódulos o repositorios independientes.
  - Ahora todo el código del backend y frontend está versionado y gestionado desde este repositorio principal.
  - Se eliminaron las carpetas `.git` internas de ambos proyectos y se realizó un commit global para incluir todos los archivos.
- A partir de ahora, toda la documentación, configuración y registro de trabajo del proyecto se centraliza en este archivo `StructureProject.md`.
---

# 📱 GymSaaS - Sistema de Gestión para Gimnasios

## 📋 Descripción General

**GymSaaS** es una aplicación móvil SaaS (Software as a Service) multiplataforma desarrollada para la gestión completa de gimnasios. La plataforma permite a los propietarios de gimnasios administrar clientes, membresías, pagos, accesos, empleados y reportes desde una interfaz móvil moderna e intuitiva.

### 🎯 Objetivo Principal
Proporcionar una solución integral para la administración de gimnasios con tres niveles de planes de suscripción, permitiendo escalar el negocio según las necesidades de cada gimnasio.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico Completo

#### 🖥️ Backend
- **Runtime:** Node.js v20+
- **Framework:** Express.js 4.18
- **Lenguaje:** TypeScript 5.3
- **Base de Datos:** MongoDB con Mongoose 8.21
- **Autenticación:** JWT (JSON Web Tokens)
- **Seguridad:** bcryptjs para encriptación de contraseñas
- **Exportación:** json2csv para generación de reportes
- **Variables de Entorno:** dotenv

#### 📱 Frontend/Mobile
- **Framework:** React Native 0.81 con Expo ~54
- **Lenguaje:** TypeScript 5.9
- **Navegación:** Expo Router 6.0 + React Navigation
- **Gestión de Estado:** Zustand 5.0
- **Estilos:** NativeWind 4.2 (TailwindCSS para React Native)
- **Gráficos:** react-native-gifted-charts
- **Componentes UI:** Expo Vector Icons, Expo Linear Gradient
- **Storage:** AsyncStorage

#### 🔄 Comunicación
- **API:** REST API con JSON
- **Autenticación:** Bearer Token (JWT)

## 📊 Planes de Suscripción

### 1. Plan Básico
- **Límite:** Hasta 100 clientes activos
- **Funcionalidades:** Gestión básica de clientes y membresías

### 2. Plan Pro
- **Límite:** Hasta 500 clientes activos
- **Funcionalidades:** Todo lo del Plan Básico + Reportes avanzados

### 3. Plan Pro+
- **Límite:** Clientes ilimitados
- **Funcionalidades:** Acceso completo a todas las características

## 👥 Roles y Permisos

### SuperAdmin
- Gestión completa de todos los gimnasios
- Activar/desactivar gimnasios
- Visualización de reportes globales
- Resetear contraseñas de administradores
- Auditoría completa del sistema

### Admin (Dueño del Gimnasio)
- Gestión completa de su gimnasio
- CRUD de clientes
- Gestión de empleados y entrenadores
- Visualización de reportes propios
- Cambio de plan de suscripción
- Procesamiento de pagos
- Configuración del gimnasio

### Empleado
- Registro de accesos de clientes
- Visualización de información de clientes
- Funcionalidades limitadas de lectura

### Entrenador
- Acceso a información de clientes asignados
- Funcionalidades similares a empleado

## 🎨 Estructura de la Aplicación Móvil

### Pantallas Principales

1. **Dashboard (index):**
   - Tarjetas de resumen (clientes activos, ingresos, asistencias)
   - Gráfico de asistencias
   - Gráfico de horas pico
   - Últimos check-ins
   - Acciones rápidas

2. **Gestión de Clientes (client):**
   - Lista completa de clientes
   - Búsqueda y filtros
   - Agregar/editar/eliminar clientes
   - Visualización de membresías activas

3. **Scanner QR (qr):**
   - Escaneo de códigos QR para registro de accesos
   - Validación de membresías activas
   - Historial de accesos

4. **Reportes (reports):**
   - Estadísticas de asistencia
   - Reportes de ingresos
   - Análisis de membresías
   - Exportación de datos (CSV)

5. **Configuración (config):**
   - Información del gimnasio
   - Cambio de plan
   - Gestión de perfil
   - Configuración de la app

6. **Login/Registro:**
   - Autenticación de usuarios
   - Registro de nuevos gimnasios
   - Recuperación de contraseña

## 🗄️ Modelos de Datos

### User
- Información de usuario (admin, empleado, entrenador, superadmin)
- Email, contraseña encriptada
- Relación con gimnasio
- Tokens de recuperación de contraseña

### Gym
- Información del gimnasio (nombre, dirección)
- Plan activo (básico, pro, proplus)
- Estado (activo/inactivo)
- Contador de clientes
- Propietario (referencia a User)

### Client
- Datos personales (nombre, email, teléfono, Instagram)
- Método de pago (transferencia, efectivo)
- Tipo de membresía
- Fechas de inicio/fin
- Estado activo/inactivo
- Relación con gimnasio

### Membership
- Plan del gimnasio
- Fechas de validez
- Estado
- Relación con gimnasio

### Payment
- Monto y fecha del pago
- Método de pago
- Relación con cliente y gimnasio
- Tipo de pago (inicial, renovación)

### AccessLog
- Registro de entradas al gimnasio
- Cliente que accedió
- Método de acceso (QR, NFC, manual)
- Timestamp

### AuditLog
- Registro de todas las acciones importantes
- Usuario que realizó la acción
- Tipo de acción (create, update, delete)
- Detalles de la acción
- Timestamp

## 🔌 API Endpoints Principales

### Autenticación (`/api/auth`)
- `POST /login` - Iniciar sesión
- `POST /logout` - Cerrar sesión

### Registro (`/api/register`)
- `POST /` - Registrar gimnasio + admin + plan

### Clientes (`/api/client`)
- `GET /` - Listar clientes del gimnasio
- `POST /` - Crear nuevo cliente
- `PUT /:id` - Actualizar cliente
- `DELETE /:id` - Eliminar cliente

### Membresías (`/api/membership`)
- `GET /` - Listar membresías
- `POST /` - Crear membresía
- `PUT /:id` - Actualizar membresía
- `DELETE /:id` - Eliminar membresía
- `POST /change-plan` - Cambiar plan del gimnasio

### Admin (`/api/admin`)
- `GET /my-membership` - Ver membresía y plan actual

### SuperAdmin (`/api/superadmin`)
- `GET /gyms` - Listar todos los gimnasios
- `PUT /gym/:id/toggle-active` - Activar/desactivar gimnasio
- `PUT /gym/:id/reset-password` - Resetear contraseña
- `GET /reports/*` - Varios endpoints de reportes

### Contraseñas (`/api/password`)
- `POST /forgot` - Solicitar recuperación
- `POST /reset` - Resetear contraseña con token

### Pagos (`/api/payment`)
- `POST /process` - Procesar pago y activar membresía
- `GET /history/:clientId` - Historial de pagos

### Staff (`/api/staff`)
- `POST /employee` - Crear empleado
- `POST /trainer` - Crear entrenador
- `GET /list` - Listar staff

### Auditoría (`/api/audit`)
- `GET /logs` - Consultar logs (SuperAdmin)

### Accesos (`/api/access`)
- `POST /register` - Registrar acceso de cliente
- `GET /history/:clientId` - Historial de accesos

### Exportación (`/api/export`)
- `GET /clients/csv` - Exportar clientes en CSV
- `GET /report/pdf` - Generar reporte en PDF

### Usuarios (`/api/user`)
- Endpoints CRUD para usuarios

## 🔐 Seguridad

### Autenticación
- Sistema de JWT con tokens Bearer
- Encriptación de contraseñas con bcryptjs
- Tokens temporales para recuperación de contraseña

### Autorización
- Middleware de verificación de roles
- Permisos granulares por endpoint
- Validación de propiedad de recursos (gimnasio)

### Auditoría
- Registro de todas las acciones críticas
- Logs persistentes en base de datos
- Trazabilidad completa de operaciones

## 📈 Funcionalidades Clave

### ✅ Implementadas
- ✓ Sistema completo de autenticación y autorización
- ✓ CRUD de clientes con límites por plan
- ✓ Sistema de membresías y planes
- ✓ Procesamiento de pagos
- ✓ Registro de accesos físicos (QR/NFC)
- ✓ Gestión de empleados y entrenadores
- ✓ Sistema de auditoría completo
- ✓ Exportación de datos (CSV)
- ✓ Reportes para SuperAdmin
- ✓ Recuperación de contraseñas
- ✓ Dashboard con métricas en tiempo real
- ✓ Gráficos de asistencia y horas pico
- ✓ Tema claro/oscuro
- ✓ Navegación con tabs

### 🔄 En Desarrollo
- Notificaciones push para vencimientos
- Scanner QR integrado con cámara
- Integración con pasarelas de pago reales
- Sistema de rutinas de entrenamiento
- Chat entre admin y clientes

## 🎯 Puntos Importantes del Proyecto

### 1. Arquitectura Multi-tenant
Cada gimnasio opera de forma independiente con sus propios datos, pero comparten la misma infraestructura y base de datos.

### 2. Escalabilidad
El sistema está diseñado para escalar desde pequeños gimnasios (100 clientes) hasta cadenas grandes (ilimitado).

### 3. Control de Acceso Granular
Sistema robusto de roles y permisos que garantiza que cada usuario solo acceda a los recursos que le corresponden.

### 4. Trazabilidad Completa
Todos los cambios importantes quedan registrados en el sistema de auditoría para análisis y seguridad.

### 5. Límites por Plan
Validación automática de límites de clientes según el plan contratado, previniendo excesos.

### 6. Experiencia de Usuario
Interfaz móvil nativa con diseño moderno usando NativeWind (TailwindCSS), tema adaptativo y navegación intuitiva.

### 7. Validación de Negocio
- Validación de membresías activas antes de permitir accesos
- Control de fechas de vencimiento
- Gestión automática de estados (activo/inactivo)

### 8. Reportes y Analytics
Sistema completo de reportes para toma de decisiones basada en datos.

## 🚀 Comandos de Desarrollo

### Backend
```bash
cd backend
npm run dev      # Servidor en modo desarrollo
npm run build    # Compilar TypeScript
npm start        # Ejecutar en producción
```

### Frontend
```bash
cd control-gym
npm start        # Iniciar Expo
npm run android  # Ejecutar en Android
npm run ios      # Ejecutar en iOS
npm run web      # Ejecutar en web
```

## 📁 Organización del Código

### Backend
- `src/models/` - Modelos de Mongoose
- `src/routes/` - Definición de endpoints
- `src/middleware/` - Autenticación y autorización
- `src/scripts/` - Scripts de utilidad (crear usuarios)

### Frontend
- `app/` - Pantallas y navegación (Expo Router)
- `components/` - Componentes reutilizables
- `stores/` - Estado global con Zustand
- `api/` - Servicios de comunicación con backend
- `constants/` - Configuración y temas
- `hooks/` - Custom hooks
- `context/` - Context providers

## 🔮 Mejoras Futuras Planificadas

- Exportación avanzada de datos: filtros, formatos personalizados, integración con Google Sheets
- Sistema de notificaciones push
- Integración con pasarelas de pago (Stripe, PayPal)
- Sistema de check-in automático con geolocalización
- App para clientes finales (ver su membresía, rutinas, pagos)
- Dashboard web para administración
- Integración con redes sociales
- Sistema de referencias y promociones
- Análisis predictivo de abandono de clientes
- Integración con dispositivos IoT (torniquetes, cerraduras inteligentes)

---

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
