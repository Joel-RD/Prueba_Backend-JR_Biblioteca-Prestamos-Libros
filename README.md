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
   - Copia el archivo `templated_env` a `.env` y completa los valores necesarios:
     ```
     cp templated_env .env
     ```
   - Edita `.env` con tus credenciales de base de datos.

4. **Crea la base de datos y las tablas:**
   - Asegúrate de tener PostgreSQL corriendo.
   - Crea la base de datos `My_books`.
   - Ejecuta el script SQL en `src/models/db.sql` para crear las tablas:


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
|--------|------------------------ |------------------------------------------|
| POST   | `/books`                | Registrar libro                          |
| POST   | `/user`                 | Registrar usuario                        |
| POST   | `/borrow`               | Registrar préstamo de libro              |
| GET    | `/user/:id/borrow`      | Listar préstamos activos de un usuario   |

### Ejemplo de payloads

- **POST /books**
  ```json
  {
    "title": "Book 1",
    "author": "Autor",
    "age_publication": "2024"
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
    "title_book": "Book 1",
    "email": "juan@mail.com"
  }
  ```

## ⚙️ Reglas de negocio

- Un usuario puede tener máximo **3 libros prestados** a la vez.
- Un libro solo puede prestarse si está en estado **disponible**.
- Si el libro ya está prestado, devuelve un error claro.
- Consulta de préstamos activos por usuario.

## 📝 Notas

- El proyecto está escrito en TypeScript.
- Los tests se encuentran en `test/app.test.js`.
- El archivo de configuración de la base de datos está en `src/config_params.ts`.

## 📂 Estructura principal

```
src/
  app.ts
  run.ts
  config_params.ts
  controllers/
  models/
  repositories/
  routers/
  utils/
test/
  app.test.js
```

## 📬 Contacto

Para dudas o sugerencias, abre un issue