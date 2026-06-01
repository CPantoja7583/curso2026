# Ejercicio Práctico - Git y Github

## Objetivo
Instalar Git, verificar su funcionamiento, inicializar un repositorio y practicar comandos básicos de Git.

## Proyecto utilizado
Carpeta de trabajo:

`C:\Users\Asus\Desktop\Adicionales\Cursos\Entrega Git y Github`

## Verificación
- Git instalado correctamente: `git version 2.54.0.windows.1`
- Repositorio Git inicializado correctamente con `git init`

## Comandos básicos de Git

### `git --version`
Definición breve:
Muestra la versión de Git instalada en el equipo.

Ejemplo de uso:

```bash
git --version
```

### `git init`
Definición breve:
Inicializa un repositorio Git en la carpeta actual para comenzar a controlar versiones.

Ejemplo de uso:

```bash
git init
```

### `git add`
Definición breve:
Agrega archivos o cambios al área de preparación (`staging`) antes de crear un commit.

Ejemplo de uso:

```bash
git add .
```

### `git commit`
Definición breve:
Guarda los cambios preparados en el historial del repositorio usando un mensaje descriptivo.

Ejemplo de uso:

```bash
git commit -m "Primer commit"
```

### `git status`
Definición breve:
Muestra el estado actual del repositorio, incluyendo archivos modificados, preparados o no rastreados.

Ejemplo de uso:

```bash
git status
```

## Flujo típico de trabajo

```bash
git add .
git commit -m "mensaje"
git status
```
