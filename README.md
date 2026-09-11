# 📚 Prueba Técnica Backend – Nivel Junior

[Sistema de gestión de préstamos para una bibliotecas](prueba_backend-Nivel-JR.md), desarrollado en Node.js con Express y PostgreSQL.

## 🚀 Instalación

1. **Clona el repositorio:**
   ```sh
   git clone https://github.com/Joel-RD/Prueba_Backend-JR_Biblioteca-Prestamos-Libros
   ```

2. **Instala las dependencias:**
   ```sh
   npm install
   ```

3. **Configura las variables de entorno:**
   - Copia el archivo `.env.example` a `.env` y completa los valores necesarios:
     ```
     cp .env.example .env
     ```
   - Edita `.env` con tus credenciales de base de datos.

4. **Crea la base de datos y las tablas:**
   - Asegúrate de tener PostgreSQL corriendo.
   - Crea la base de datos indicada en `DB_NAME` del `.env` (por defecto `library`).
   - Ejecuta el script SQL en `src/models/schema.sql` para crear las tablas.


## 🏃‍♂️ Ejecución

- **Modo desarrollo (con recarga automática):**
  ```sh
  npm run dev
  ```

- **Modo producción:**
  ```sh
  npm run build && npm run start
  ```

## 🧪 Pruebas

Ejecuta los tests con:
```sh
npm test
```

## 📖 Endpoints

| Método | Endpoint                | Descripción                              |
|-------- |------------------------ |------------------------------------------|
| POST   | `/books`                | Registrar libro                          |
| POST   | `/user`                 | Registrar usuario                        |
| POST   | `/borrow`               | Registrar préstamo de libro              |
| POST   | `/return`               | Registrar devolución de libro            |
| GET    | `/user/:id/borrow`      | Listar préstamos activos de un usuario   |

### Ejemplo de payloads

- **POST /books**
  ```json
  {
    "title": "Book 1",
    "author": "Autor",
    "publicationYear": "2024"
  }
  ```

- **POST /user**
  ```json
  {
    "name": "Juan",
    "email": "juan@mail.com",
    "password": "Pass@1234"
  }
  ```

- **POST /borrow**
  ```json
  {
    "bookTitle": "Book 1",
    "email": "juan@mail.com"
  }
  ```

- **POST /return**
  ```json
  {
    "bookTitle": "Book 1",
    "email": "juan@mail.com"
  }
  ```

## ⚙️ Reglas de negocio

- Un usuario puede tener máximo **3 libros prestados** a la vez.
- Un libro solo puede prestarse si está en estado **disponible**.
- Si el libro ya está prestado, devuelve un error claro.
- Al devolver un libro, este vuelve a estado **disponible** y se registra la fecha de devolución.
- Consulta de préstamos activos (sin devolver) por usuario.

## 📝 Respuestas de error

Todos los errores devuelven un JSON estructurado:

```json
{
  "error": "The book is currently on loan"
}
```

Códigos de estado usados: `400` (validación), `403` (límite de 3 préstamos), `404` (recurso no encontrado), `409` (conflicto: libro prestado o duplicado) y `500` (error interno).

## 📝 Notas

- El proyecto está escrito en TypeScript.
- La validación de los `body`/`params` se hace con `zod` en `src/utils/validators.ts`.
- El préstamo (`POST /borrow`) corre dentro de una transacción para evitar condiciones de carrera.
- Los tests se encuentran en `test/library.test.js`.
- El archivo de configuración de la base de datos está en `src/config.ts`.

## 📂 Estructura principal

```
src/
  app.ts
  server.ts
  config.ts
  controllers/
  models/
  routes/
  utils/
test/
  library.test.js
```

## 📬 Contacto

Para dudas o sugerencias, abre un issue