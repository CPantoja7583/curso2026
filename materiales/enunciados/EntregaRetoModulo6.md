Reto:

I. Ejecución Práctica.

PARTE 1: Desarrolle un servicio web en node el cual responda a peticiones HTTP de tipo
GET y POST. El servicio administrará cartones de un juego de números aleatorios como de
lotería (estilo KINO). Los métodos HTTP deberán hacer lo siguiente:

a. GET: entrega la lista completa de cartones generados.
b. POST: Crea un nuevo cartón.

Cada cartón tendrá 15 números generados al azar, sin repetirse, entre el 1 y 30, además
de un número de serie único. Ejemplo visual de 2 cartones generados por el servicio web:

Número de
serie: 1
1 3 7
8 9 15
17 23 24
25 26 27
28 29 30

Número de
serie: 2
5 6 7
9 10 12
14 18 19
21 23 24
25 27 29

Al levantar, el servicio web deberá crear automáticamente 5 cartones y luego comenzar su
servicio.

PARTE 2: Desarrolle un FRONT END básico para consumir el servicio web de cartones. Para
ello construya 3 páginas:

a. Menú principal
b. Listado de cartones
c. Petición de creación de un nuevo cartón
