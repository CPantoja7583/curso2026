Ejercicio Práctico - Git y Github
Actividad Práctica : Instalación y comandos básicos de Git
Objetivo:
Instalar Git en tu equipo, verificar que funcione correctamente, inicializar un repositorio en tu proyecto y practicar el uso de los comandos básicos de Git que permitirán gestionar tu portafolio profesional.

Descripción de la tarea :

Instalar Git en tu equipo

Descarga Git desde la página oficial según tu sistema operativo:

Windows

macOS

Linux

Una vez instalado, abre la terminal o consola de tu sistema y escribe:

git --version
Si la instalación fue correcta, deberías ver un número de versión (ejemplo: git version 2.x.x).

💡 Tip: Si no aparece nada, cierra y vuelve a abrir la terminal. En Windows asegúrate de haber marcado la opción “Add Git to PATH” durante la instalación.

Acceder a tu proyecto e inicializar Git

En la terminal, navega hasta la carpeta donde tienes tu proyecto (el mismo que vienes trabajando desde las lecciones anteriores).

cd ruta/a/tu/proyecto
Comprueba que estás en la carpeta correcta usando:

ls en macOS/Linux

dir en Windows

Inicializa un repositorio Git:

git init
Definir y ejemplificar comandos básicos de Git

En la raíz de tu proyecto, crea un archivo llamado comandos_git.txt o bien utiliza un README.md.

En este archivo, escribe una definición breve y un ejemplo de uso para cada uno de los siguientes comandos:

Comando Definición breve Ejemplo de uso
git --version Muestra la versión instalada de Git git --version
git init Inicializa un repositorio en la carpeta actual git init
git add Agrega cambios al área de preparación (staging) git add . (agrega todos los archivos)
git commit Registra los cambios con un mensaje descriptivo git commit -m "Primer commit"
git status Muestra el estado del repositorio git status
💡 Tip: El flujo típico de trabajo es:

git add .
git commit -m "mensaje"
git status

⏱️ Tiempo aproximado: 20–30 minutos.
📤 Forma de entrega:

Opción A: Sube un archivo comprimido (.zip) con tu proyecto y el archivo comandos_git.txt o README.md.

Opción B: Comparte el enlace a tu repositorio en GitHub.
