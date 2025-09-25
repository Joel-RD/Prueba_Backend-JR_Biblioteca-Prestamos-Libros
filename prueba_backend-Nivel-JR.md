
# 📝 Prueba Técnica Backend – Nivel Junior

## Contexto

Una pequeña biblioteca quiere crear un sistema interno para gestionar préstamos de libros. La idea no es solo guardar datos, sino aplicar lógica de negocio simple que simule la realidad.

## Objetivo

Construir un servicio backend sencillo que permita:

- Registrar libros.
- Registrar usuarios.
- Permitir que un usuario pida prestado un libro.
- Aplicar reglas de negocio específicas.

## 📌 Requisitos Funcionales

**Registrar libros con:**
- Título
- Autor
- Año de publicación
- Estado (disponible o prestado)

**Registrar usuarios con:**
- Nombre
- Email
- Fecha de registro

**Préstamo de libro**
- Un usuario puede tener máximo 3 libros prestados a la vez.
- Un libro solo puede estar en estado disponible para prestarse.
- Si el libro ya está prestado, debe devolver un error claro.
- Consulta de préstamos activos por usuario.

## 📌 Requisitos Técnicos

- **Lenguaje:** cualquiera de preferencia (Node.js, Python, Java, Go, etc.).
- **Base de datos:** a elección (puede ser en memoria, SQLite, o cualquier otra).
- **API REST** con al menos los siguientes endpoints:
  - `POST /libros` → Crear libro
  - `POST /usuarios` → Crear usuario
  - `POST /prestamos` → Registrar préstamo
  - `GET /usuarios/:id/prestamos` → Listar préstamos activos del usuario

## 🎯 Metas a alcanzar

**Mínimo (aprobatorio):**
- Endpoints funcionando.
- Reglas de negocio básicas (no más de 3 préstamos por usuario, validación de disponibilidad).

**Plus (extra points):**
- Manejo de errores bien estructurados (ej. mensajes claros y códigos HTTP adecuados).
- Tests unitarios básicos.
- Documentación breve en README explicando cómo correr el proyecto.

## 🕐 Tiempo de entrega

Se entrega en 24 horas desde que recibes esta prueba.

El repositorio (GitHub, GitLab o similar) debe incluir instrucciones de instalación y ejecución.

## 💡 Tip para el candidato

No importa tanto la tecnología que uses, sino que el código sea claro, organizado y entendible. Se evaluará tu capacidad para:

- Resolver problemas lógicos.
- Escribir código limpio y modular.
- Implementar reglas