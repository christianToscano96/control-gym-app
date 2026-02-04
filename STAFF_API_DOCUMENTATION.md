# Documentación del Sistema de Staff

## Descripción General

Sistema completo para la gestión de staff (empleados y entrenadores) en el sistema de gimnasios. Incluye backend con API REST completa y frontend con React Native.

## Backend - API REST

### Tecnologías Utilizadas

- **Express.js** - Framework web
- **MongoDB/Mongoose** - Base de datos
- **Multer** - Subida de archivos (avatares)
- **bcryptjs** - Encriptación de contraseñas
- **JWT** - Autenticación

### Endpoints Disponibles

#### 1. Crear Staff

```
POST /api/staff
```

**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Body (FormData):**

- `name` (string, requerido) - Nombre completo
- `email` (string, requerido) - Email único
- `password` (string, requerido, min 6 caracteres)
- `role` (string, requerido) - "empleado" o "entrenador"
- `phone` (string, opcional) - Teléfono
- `avatar` (file, opcional) - Imagen de perfil (max 5MB, jpeg/jpg/png/gif)

**Response (201):**

```json
{
  "message": "Staff creado exitosamente",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "entrenador",
    "phone": "+1234567890",
    "avatar": "/uploads/avatars/staff-123456789.jpg",
    "active": true,
    "gym": "gymId",
    "createdAt": "2026-02-03T...",
    "updatedAt": "2026-02-03T..."
  }
}
```

**Validaciones:**

- Email único en el sistema
- Password mínimo 6 caracteres
- Rol válido (empleado/entrenador)
- Email formato válido
- Imagen máximo 5MB y formatos permitidos

---

#### 2. Listar Todo el Staff

```
GET /api/staff
```

**Headers:**

- `Authorization: Bearer {token}`

**Response (200):**

```json
{
  "count": 5,
  "staff": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "entrenador",
      "active": true,
      ...
    },
    ...
  ]
}
```

---

#### 3. Obtener Staff por ID

```
GET /api/staff/:id
```

**Headers:**

- `Authorization: Bearer {token}`

**Response (200):**

```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "entrenador",
  "phone": "+1234567890",
  "avatar": "/uploads/avatars/staff-123456789.jpg",
  "active": true,
  "gym": "gymId",
  "createdAt": "2026-02-03T...",
  "updatedAt": "2026-02-03T..."
}
```

---

#### 4. Actualizar Staff

```
PUT /api/staff/:id
```

**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Body (FormData):**

- `name` (string, opcional)
- `email` (string, opcional)
- `phone` (string, opcional)
- `role` (string, opcional) - "empleado" o "entrenador"
- `active` (boolean, opcional)
- `avatar` (file, opcional) - Nueva imagen

**Response (200):**

```json
{
  "message": "Staff actualizado exitosamente",
  "user": { ... }
}
```

**Nota:** Al actualizar el avatar, el anterior se elimina automáticamente del sistema de archivos.

---

#### 5. Cambiar Contraseña

```
PATCH /api/staff/:id/password
```

**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:**

```json
{
  "password": "nuevaPassword123"
}
```

**Response (200):**

```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Validaciones:**

- Password mínimo 6 caracteres

---

#### 6. Activar/Desactivar Staff

```
PATCH /api/staff/:id/toggle-status
```

**Headers:**

- `Authorization: Bearer {token}`

**Response (200):**

```json
{
  "message": "Staff activado exitosamente",
  "user": { ... }
}
```

**Nota:** Alterna el estado `active` del staff entre true/false.

---

#### 7. Eliminar Staff (Soft Delete)

```
DELETE /api/staff/:id
```

**Headers:**

- `Authorization: Bearer {token}`

**Response (200):**

```json
{
  "message": "Staff eliminado exitosamente"
}
```

**Nota:** No elimina el registro, solo lo desactiva (active = false).

---

#### 8. Buscar Staff

```
GET /api/staff/search/:query
```

**Headers:**

- `Authorization: Bearer {token}`

**Parámetros:**

- `query` - Término de búsqueda (nombre, email o teléfono)

**Response (200):**

```json
{
  "count": 2,
  "staff": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      ...
    },
    ...
  ]
}
```

**Nota:** La búsqueda es case-insensitive y busca coincidencias en nombre, email y teléfono.

---

## Frontend - React Native

### Tecnologías Utilizadas

- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **Expo Router** - Navegación
- **Expo Image Picker** - Selector de imágenes
- **AsyncStorage** - Almacenamiento local

### Componente Principal

**Ubicación:** `/control-gym/app/screens/staff-screen/index.tsx`

### Características del Formulario

#### Campos del Formulario:

1. **Profile Photo (Opcional)**
   - Selector de imagen con preview
   - Crop cuadrado (1:1)
   - Calidad 0.8

2. **Full Name (Requerido)**
   - Campo de texto
   - Icono: persona

3. **Email Address (Requerido)**
   - Campo de email
   - Validación de formato
   - Auto-lowercase
   - Icono: correo

4. **Phone Number (Opcional)**
   - Teclado numérico
   - Icono: teléfono

5. **Password (Requerido)**
   - Campo seguro
   - Mínimo 6 caracteres
   - Toggle mostrar/ocultar
   - Icono: candado

6. **Assign Role (Requerido)**
   - Dropdown con opciones:
     - Trainer (entrenador)
     - Staff (empleado)
   - Icono: ribbon

### Validaciones del Cliente

```typescript
// Validación de nombre
if (!formData.fullName.trim()) {
  Alert.alert("Error", "El nombre es obligatorio");
}

// Validación de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(formData.email)) {
  Alert.alert("Error", "El email no es válido");
}

// Validación de contraseña
if (formData.password.length < 6) {
  Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
}

// Validación de rol
if (!formData.role) {
  Alert.alert("Error", "Debe seleccionar un rol");
}
```

### API Service

**Ubicación:** `/control-gym/api/staff.ts`

#### Funciones Disponibles:

```typescript
// Crear staff
createStaff(token: string, formData: FormData)

// Obtener todos
fetchStaff(token: string)

// Obtener uno
fetchStaffById(token: string, staffId: string)

// Actualizar
updateStaff(token: string, staffId: string, formData: FormData)

// Cambiar contraseña
updateStaffPassword(token: string, staffId: string, password: string)

// Toggle status
toggleStaffStatus(token: string, staffId: string)

// Eliminar
deleteStaff(token: string, staffId: string)

// Buscar
searchStaff(token: string, query: string)
```

### Flujo de Creación

```typescript
const handleCreateUser = async () => {
  // 1. Validar formulario
  if (!validateForm()) return;

  // 2. Obtener token de autenticación
  const token = await AsyncStorage.getItem("userToken");

  // 3. Preparar FormData
  const formDataToSend = new FormData();
  formDataToSend.append("name", formData.fullName);
  formDataToSend.append("email", formData.email.toLowerCase());
  formDataToSend.append("password", formData.password);
  formDataToSend.append("role", formData.role);

  if (formData.phone) {
    formDataToSend.append("phone", formData.phone);
  }

  if (profileImage) {
    formDataToSend.append("avatar", {
      uri: profileImage,
      name: `avatar.${fileType}`,
      type: `image/${fileType}`,
    });
  }

  // 4. Enviar al backend
  await createStaff(token, formDataToSend);

  // 5. Mostrar éxito y navegar
  Alert.alert("Éxito", "Staff creado exitosamente", [
    { text: "OK", onPress: () => router.back() },
  ]);
};
```

### Estados de Carga

El formulario maneja estados de carga:

- **loading = false**: Botón habilitado, texto "Create User"
- **loading = true**: Botón deshabilitado, muestra ActivityIndicator

### Temas y Estilos

El componente soporta tema claro/oscuro mediante `useTheme()`:

- Colores dinámicos
- Sombras adaptativas
- Bordes condicionales

---

## Modelo de Datos

### User Model (Staff)

```typescript
interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string; // Hash bcrypt
  role: "empleado" | "entrenador" | "admin" | "superadmin";
  gym: ObjectId; // Referencia al gimnasio
  active: boolean;
  phone?: string;
  avatar?: string; // Path relativo
  createdAt: Date;
  updatedAt: Date;
  resetToken?: string;
  resetTokenExpires?: number;
}
```

### Índices:

- `email`: único
- `gym`: para queries por gimnasio
- `role`: para filtrar por tipo

---

## Seguridad

### Autenticación

- Todos los endpoints requieren token JWT válido
- Rol mínimo requerido: **admin**

### Middleware

```typescript
authenticateJWT; // Verifica token válido
requireAdmin; // Verifica rol admin o superadmin
```

### Autorización

- Solo admins pueden gestionar staff
- Staff solo puede ver/editar su propio gimnasio
- Passwords hasheados con bcrypt (10 rounds)

### Validación de Archivos

- Tipos permitidos: jpeg, jpg, png, gif
- Tamaño máximo: 5MB
- Validación de mimetype y extensión

---

## Manejo de Errores

### Backend

```typescript
try {
  // Lógica
} catch (error: any) {
  console.error("Error al crear staff:", error);
  res.status(500).json({
    message: "Error al crear el staff",
    error: error.message,
  });
}
```

### Frontend

```typescript
try {
  await createStaff(token, formDataToSend);
  Alert.alert("Éxito", "Staff creado exitosamente");
} catch (error: any) {
  console.error("Error al crear staff:", error);
  Alert.alert("Error", error.message || "Hubo un error...");
} finally {
  setLoading(false);
}
```

---

## Próximas Mejoras

### Backend

- [ ] Paginación en listado de staff
- [ ] Filtros avanzados (por rol, activo/inactivo, fecha)
- [ ] Estadísticas de staff
- [ ] Logs de auditoría para cambios en staff
- [ ] Validación de permisos más granular
- [ ] Compresión automática de imágenes

### Frontend

- [ ] Lista de staff existente
- [ ] Edición de staff
- [ ] Vista de detalles del staff
- [ ] Búsqueda en tiempo real
- [ ] Filtros por rol y estado
- [ ] Exportación de lista de staff
- [ ] Confirmación antes de eliminar
- [ ] Toast notifications en lugar de Alert

---

## Testing

### Endpoints a Probar

1. Crear staff sin token → 401
2. Crear staff con token no-admin → 403
3. Crear staff con email duplicado → 400
4. Crear staff con password corto → 400
5. Crear staff con rol inválido → 400
6. Crear staff válido → 201
7. Crear staff con avatar → 201 + archivo guardado
8. Listar staff del gimnasio → 200
9. Buscar staff → 200
10. Actualizar staff → 200
11. Cambiar contraseña → 200
12. Toggle status → 200
13. Eliminar staff → 200 + active=false

### Casos de Prueba Frontend

1. Enviar formulario vacío → validaciones
2. Email inválido → error
3. Password < 6 caracteres → error
4. Sin rol seleccionado → error
5. Formulario completo válido → éxito
6. Con imagen de perfil → éxito + imagen
7. Sin conexión → error de red

---

## Archivos Modificados/Creados

### Backend

- ✅ `/backend/src/routes/staff.ts` - Rutas completas del staff
- ✅ Usa modelo existente `/backend/src/models/User.ts`

### Frontend

- ✅ `/control-gym/api/staff.ts` - Servicios API
- ✅ `/control-gym/app/screens/staff-screen/index.tsx` - Formulario completo

### Documentación

- ✅ `/STAFF_API_DOCUMENTATION.md` - Este archivo

---

## Configuración Necesaria

### Backend

```bash
cd backend
npm install
# Dependencias ya instaladas: bcryptjs, multer, express, mongoose
```

### Frontend

```bash
cd control-gym
npm install
# Dependencias ya instaladas: expo-image-picker, @react-native-async-storage/async-storage
```

### Variables de Entorno

```env
# Backend (.env)
PORT=4000
MONGODB_URI=mongodb://localhost:27017/gym-saas
JWT_SECRET=your-secret-key
```

### Permisos Móvil

Asegúrate de tener los permisos en `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow access to select profile picture"
        }
      ]
    ]
  }
}
```

---

## Soporte

Para problemas o preguntas:

1. Revisar logs del backend: `console.error`
2. Revisar logs del frontend: `console.error`
3. Verificar token JWT válido
4. Verificar permisos del usuario (debe ser admin)
5. Verificar conexión a base de datos
6. Verificar carpeta uploads existe y tiene permisos

---

## Licencia

MIT
