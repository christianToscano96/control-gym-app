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

### PROPUESTA DE CLAUDE AI

Revisión Completa: Control Gym App
Arquitectura General
Es una app Expo + React Native con Expo Router, NativeWind (Tailwind), Zustand, y un backend REST custom en el puerto 4000. La estructura es sólida y bien organizada. Dicho esto, hay bastantes oportunidades de mejora.

1. Seguridad (Prioridad Alta)
   1.1 API URL hardcodeada
   En api.ts, la IP local está expuesta directamente:

http://192.168.100.145:4000
Propuesta: Usar variables de entorno con expo-constants o un archivo .env con expo-env. Esto permite tener configuraciones por entorno (dev, staging, producción).

1.2 Token sin manejo centralizado
Cada llamada API obtiene el token de AsyncStorage o del store de forma independiente. No hay interceptor ni refresh token.

Propuesta: Crear un API client centralizado (wrapper de fetch o usar axios con interceptors) que:

Adjunte automáticamente el token Bearer
Maneje respuestas 401 (token expirado) con logout automático
Maneje errores de red de forma uniforme
1.3 Sin validación de inputs en frontend
Los formularios (login, registro, nuevo cliente) tienen validación mínima. No se sanitizan emails ni se valida formato de DNI.

Propuesta: Implementar validación con una librería como zod o yup + react-hook-form para manejar formularios de forma robusta.

2. Arquitectura y Patrones (Prioridad Alta)
   2.1 Datos mock hardcodeados en producción
   En RecentCheckIns.tsx hay datos ficticios directamente en el componente. En useClientDetails.ts los pagos son mock. En reports/index.tsx los reportes son mock.

Propuesta: Reemplazar todos los datos mock con llamadas reales a la API. Si el backend aún no los soporta, al menos extraer los mocks a un archivo separado tipo **mocks**/ para distinguir claramente qué es temporal.

2.2 Manejo de errores inconsistente
Algunos lugares usan Alert.alert(), otros console.error(), otros Toast, y otros simplemente ignoran errores.

Propuesta: Estandarizar el manejo de errores:

Errores de usuario (validación) → Toast
Errores de red → Toast con retry
Errores críticos → Pantalla de error
Crear un hook useApiCall que encapsule try/catch, loading y error states
2.3 Sin manejo de estado offline
No hay caché de datos ni manejo de conectividad.

Propuesta: Considerar @tanstack/react-query (TanStack Query) para:

Cache automático de datos
Refetch en reconexión
Estados de loading/error/success unificados
Invalidación inteligente de queries
Eliminación de la lógica manual de fetch en cada pantalla 3. Código y Calidad (Prioridad Media)
3.1 Typo en nombre de archivo
HeaderTopScrenn.tsx → debería ser HeaderTopScreen.tsx

3.2 Carpeta mal nombrada
app/screens/qr-acess/ → debería ser qr-access/ (falta una "c")

3.3 Componentes con lógica de negocio mezclada
Pantallas como login/index.tsx y NewClientScreen.tsx tienen la lógica de fetch, transformación de datos y UI en el mismo archivo.

Propuesta: Aplicar el patrón custom hooks de forma consistente:

useLogin() → lógica de autenticación
useNewClient() → lógica de creación de cliente
Componentes solo renderizan UI
3.4 Sin testing
No hay ningún test unitario ni de integración.

Propuesta: Agregar al menos:

Tests unitarios para utils (membershipUtils.ts) con Jest
Tests de hooks con @testing-library/react-hooks
Tests de componentes con @testing-library/react-native
Tests e2e con Detox o Maestro
3.5 Sin linting/formatting configurado apropiadamente
ESLint está instalado pero no hay Prettier configurado ni pre-commit hooks.

Propuesta: Configurar:

Prettier con reglas consistentes
husky + lint-staged para pre-commit hooks
Reglas de ESLint para imports ordenados 4. UX/UI (Prioridad Media)
4.1 Sin skeleton loaders
Las pantallas muestran ActivityIndicator genéricos mientras cargan.

Propuesta: Implementar skeleton screens (placeholders animados) para dashboard, lista de clientes y detalles de cliente. Da una sensación mucho más profesional.

4.2 Sin pull-to-refresh en todas las listas
Solo reports tiene RefreshControl.

Propuesta: Agregar pull-to-refresh en la lista de clientes, dashboard y cualquier pantalla con datos dinámicos.

4.3 Sin paginación en lista de clientes
fetchClients trae todos los clientes de una vez.

Propuesta: Implementar paginación infinita con FlatList + onEndReached para mejorar rendimiento con muchos clientes. Esto requiere soporte del backend.

4.4 Sin confirmación al eliminar cliente
En useClientActions.ts hay un Alert.alert de confirmación, pero no hay feedback visual durante la eliminación ni opción de "deshacer".

Propuesta: Agregar un toast con "Deshacer" por unos segundos antes de ejecutar la eliminación definitiva.

4.5 Sin accesibilidad (a11y)
Los componentes no tienen accessibilityLabel, accessibilityRole, ni accessibilityHint.

Propuesta: Agregar props de accesibilidad a todos los elementos interactivos, especialmente botones, inputs y cards clickeables.

5. Performance (Prioridad Media)
   5.1 Sin memoización
   No se usa React.memo, useMemo, ni useCallback en componentes que reciben props o listas grandes.

Propuesta: Memoizar:

Items de listas (ItemClient, ClientListItem)
Callbacks pasados a componentes hijos
Cálculos derivados (filtros, búsquedas)
5.2 FlatList no optimizada
ListClients.tsx usa ScrollView con .map() en vez de FlatList.

Propuesta: Reemplazar con FlatList que virtualiza el renderizado. Crucial si la lista de clientes crece.

5.3 Imágenes sin cache
Se usa expo-image pero no se configura cache policy para avatares.

Propuesta: Configurar cachePolicy en componentes de imagen para evitar re-descargas innecesarias.

6. Funcionalidades Faltantes o Incompletas
   6.1 Reportes 100% mock
   La pantalla de reportes usa datos estáticos. Los botones de exportar tienen lógica comentada.

Propuesta: Priorizar la integración real con el backend para al menos un tipo de reporte (ej: clientes activos) como MVP.

6.2 Sin notificaciones push
Están en la config pero no implementadas.

Propuesta: Implementar con expo-notifications para:

Recordar renovaciones de membresía próximas a vencer
Alertas de check-in de clientes
Notificaciones de pagos pendientes
6.3 Sin funcionalidad "Olvidé mi contraseña"
El link existe en login pero no hace nada.

Propuesta: Implementar flujo de recuperación de contraseña con email.

6.4 Cambiar contraseña / idioma / horarios no implementados
En config/index.tsx, varias opciones solo muestran Alert.alert("Próximamente").

Propuesta: Documentar un roadmap claro de qué features faltan y priorizarlos.

7. DevOps y Deployment
   7.1 Sin CI/CD
   No hay configuración de GitHub Actions ni EAS Build.

Propuesta: Configurar:

GitHub Actions para lint + tests en cada PR
EAS Build para builds automáticos (dev/preview/production)
EAS Update para actualizaciones OTA
7.2 Sin manejo de versiones
La versión es fija en 1.0.0.

Propuesta: Usar versionado semántico automatizado con standard-version o semantic-release.

Resumen de Prioridades
Prioridad Mejora Impacto
Alta API client centralizado con interceptors Seguridad + DX
Alta Variables de entorno para API URL Seguridad
Alta TanStack Query para data fetching Arquitectura
Alta Validación de formularios (zod + react-hook-form) UX + Seguridad
Media Reemplazar ScrollView por FlatList Performance
Media Skeleton loaders UX
Media Testing (Jest + RTL) Calidad
Media Completar features mock (reportes, notificaciones) Funcionalidad
Media Memoización de componentes Performance
Baja CI/CD con GitHub Actions + EAS DevOps
Baja Accesibilidad (a11y) Inclusión
Baja Corregir typos (HeaderTopScrenn, qr-acess) Limpieza
¿Quieres que implemente alguna de estas mejoras? Puedo empezar por las de prioridad alta o por la que prefieras.
