# Guía Rápida de Testing - API de Staff

## Requisitos Previos

1. Backend corriendo en `http://localhost:4000` (o tu PORT configurado)
2. Token JWT válido de un usuario admin
3. Postman, Insomnia o similar

## Variables de Entorno para Postman

```json
{
  "base_url": "http://localhost:4000",
  "admin_token": "tu-token-jwt-aqui"
}
```

---

## 1. Crear Staff (POST)

**URL:** `{{base_url}}/api/staff`

**Headers:**

```
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**

```
name: Juan Pérez
email: juan.perez@gym.com
password: password123
role: entrenador
phone: +34612345678
avatar: [seleccionar archivo de imagen]
```

**Respuesta esperada (201):**

```json
{
  "message": "Staff creado exitosamente",
  "user": {
    "_id": "65abc123...",
    "name": "Juan Pérez",
    "email": "juan.perez@gym.com",
    "role": "entrenador",
    "phone": "+34612345678",
    "avatar": "/uploads/avatars/staff-1706894567890-123456789.jpg",
    "active": true,
    "gym": "65xyz789...",
    "createdAt": "2026-02-03T10:30:00.000Z",
    "updatedAt": "2026-02-03T10:30:00.000Z"
  }
}
```

---

## 2. Listar Todo el Staff (GET)

**URL:** `{{base_url}}/api/staff`

**Headers:**

```
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada (200):**

```json
{
  "count": 3,
  "staff": [
    {
      "_id": "65abc123...",
      "name": "Juan Pérez",
      "email": "juan.perez@gym.com",
      "role": "entrenador",
      "active": true,
      ...
    },
    {
      "_id": "65abc124...",
      "name": "María García",
      "email": "maria.garcia@gym.com",
      "role": "empleado",
      "active": true,
      ...
    }
  ]
}
```

---

## 3. Obtener Staff por ID (GET)

**URL:** `{{base_url}}/api/staff/65abc123...`

**Headers:**

```
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada (200):**

```json
{
  "_id": "65abc123...",
  "name": "Juan Pérez",
  "email": "juan.perez@gym.com",
  "role": "entrenador",
  "phone": "+34612345678",
  "avatar": "/uploads/avatars/staff-123.jpg",
  "active": true,
  "gym": "65xyz789...",
  "createdAt": "2026-02-03T10:30:00.000Z",
  "updatedAt": "2026-02-03T10:30:00.000Z"
}
```

---

## 4. Actualizar Staff (PUT)

**URL:** `{{base_url}}/api/staff/65abc123...`

**Headers:**

```
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**

```
name: Juan Pérez Martínez
phone: +34612345999
role: empleado
```

**Respuesta esperada (200):**

```json
{
  "message": "Staff actualizado exitosamente",
  "user": {
    "_id": "65abc123...",
    "name": "Juan Pérez Martínez",
    "phone": "+34612345999",
    "role": "empleado",
    ...
  }
}
```

---

## 5. Cambiar Contraseña (PATCH)

**URL:** `{{base_url}}/api/staff/65abc123.../password`

**Headers:**

```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "password": "newPassword456"
}
```

**Respuesta esperada (200):**

```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

---

## 6. Toggle Status (PATCH)

**URL:** `{{base_url}}/api/staff/65abc123.../toggle-status`

**Headers:**

```
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada (200):**

```json
{
  "message": "Staff desactivado exitosamente",
  "user": {
    "_id": "65abc123...",
    "name": "Juan Pérez",
    "active": false,
    ...
  }
}
```

---

## 7. Eliminar Staff (DELETE)

**URL:** `{{base_url}}/api/staff/65abc123...`

**Headers:**

```
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada (200):**

```json
{
  "message": "Staff eliminado exitosamente"
}
```

**Nota:** El staff se desactiva (active=false) pero no se elimina de la BD.

---

## 8. Buscar Staff (GET)

**URL:** `{{base_url}}/api/staff/search/juan`

**Headers:**

```
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada (200):**

```json
{
  "count": 2,
  "staff": [
    {
      "_id": "65abc123...",
      "name": "Juan Pérez",
      "email": "juan.perez@gym.com",
      ...
    },
    {
      "_id": "65abc125...",
      "name": "Juana López",
      "email": "juana.lopez@gym.com",
      ...
    }
  ]
}
```

---

## Errores Comunes

### 401 Unauthorized

```json
{
  "message": "Token no proporcionado" // o "Token inválido"
}
```

**Solución:** Verifica que el token JWT esté en el header Authorization.

### 403 Forbidden

```json
{
  "message": "Acceso denegado"
}
```

**Solución:** El token debe ser de un usuario con rol admin o superadmin.

### 400 Bad Request

```json
{
  "message": "El email ya está registrado"
}
```

**Solución:** Usa un email diferente.

```json
{
  "message": "La contraseña debe tener al menos 6 caracteres"
}
```

**Solución:** Usa una contraseña más larga.

```json
{
  "message": "Rol inválido"
}
```

**Solución:** Usa "empleado" o "entrenador".

### 404 Not Found

```json
{
  "message": "Staff no encontrado"
}
```

**Solución:** Verifica que el ID sea correcto y que el staff pertenezca a tu gimnasio.

---

## Colección de Postman

Puedes importar esta colección JSON:

```json
{
  "info": {
    "name": "Staff API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:4000"
    },
    {
      "key": "admin_token",
      "value": "TU_TOKEN_AQUI"
    }
  ],
  "item": [
    {
      "name": "Crear Staff",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "name",
              "value": "Juan Pérez",
              "type": "text"
            },
            {
              "key": "email",
              "value": "juan.perez@gym.com",
              "type": "text"
            },
            {
              "key": "password",
              "value": "password123",
              "type": "text"
            },
            {
              "key": "role",
              "value": "entrenador",
              "type": "text"
            },
            {
              "key": "phone",
              "value": "+34612345678",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "{{base_url}}/api/staff",
          "host": ["{{base_url}}"],
          "path": ["api", "staff"]
        }
      }
    },
    {
      "name": "Listar Staff",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/staff",
          "host": ["{{base_url}}"],
          "path": ["api", "staff"]
        }
      }
    },
    {
      "name": "Buscar Staff",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/staff/search/juan",
          "host": ["{{base_url}}"],
          "path": ["api", "staff", "search", "juan"]
        }
      }
    }
  ]
}
```

---

## Script de Testing Rápido

Si tienes Node.js, puedes usar este script:

```javascript
// test-staff.js
const API_BASE = "http://localhost:4000";
const ADMIN_TOKEN = "tu-token-aqui";

async function testStaffAPI() {
  try {
    // 1. Crear staff
    const createResponse = await fetch(`${API_BASE}/api/staff`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: `test${Date.now()}@gym.com`,
        password: "password123",
        role: "entrenador",
        phone: "+34612345678",
      }),
    });

    const created = await createResponse.json();
    console.log("✅ Staff creado:", created);

    // 2. Listar staff
    const listResponse = await fetch(`${API_BASE}/api/staff`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });

    const list = await listResponse.json();
    console.log("✅ Staff listado:", list.count, "items");

    // 3. Buscar staff
    const searchResponse = await fetch(`${API_BASE}/api/staff/search/test`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });

    const search = await searchResponse.json();
    console.log("✅ Búsqueda:", search.count, "resultados");

    console.log("\n🎉 Todos los tests pasaron!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testStaffAPI();
```

Ejecutar:

```bash
node test-staff.js
```

---

## Checklist de Testing

- [ ] Crear staff sin autenticación → 401
- [ ] Crear staff con usuario no-admin → 403
- [ ] Crear staff con email duplicado → 400
- [ ] Crear staff con password corto → 400
- [ ] Crear staff válido → 201 ✅
- [ ] Crear staff con imagen → 201 ✅
- [ ] Listar staff → 200 ✅
- [ ] Obtener staff por ID → 200 ✅
- [ ] Actualizar staff → 200 ✅
- [ ] Cambiar contraseña → 200 ✅
- [ ] Toggle status → 200 ✅
- [ ] Eliminar staff → 200 ✅
- [ ] Buscar staff → 200 ✅
- [ ] Verificar imagen guardada en /uploads/avatars/
- [ ] Verificar password hasheado en BD
- [ ] Verificar staff solo ve su gimnasio

---

## Soporte

Si encuentras algún error:

1. Verifica que el backend esté corriendo
2. Verifica las variables de entorno (.env)
3. Verifica que MongoDB esté corriendo
4. Revisa los logs del backend
5. Verifica que la carpeta uploads/avatars exista y tenga permisos de escritura
