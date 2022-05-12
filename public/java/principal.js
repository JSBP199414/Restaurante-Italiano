"use strict"

/*--------------------------------Cambio de pagina------------------------------------*/

let imagenes = new Array(
    ['/public/imagenes/principal/Pizzas.jpg'],
    ['/public/imagenes/principal/Pastas.jpg'],
    ['/public/imagenes/principal/PizzasDos.jpg'],
);
let contador=0;

/**
 * Funcion para cambiar la imagen 
 */
function rotarImagenes()
{
    // cambiamos la imagen 
    document.getElementById("imagenes").src=imagenes[contador%imagenes.length]; 
    contador++ 
}
 

/*----------------------------------------Funcion windows---------------------------------------*/
//Funcion cada vez que carga la pantalla
 window.onload = function ()
{
    //--------------Caragamos la funcion rotarImagenes del archivo principal.js--------------------
    // Cargamos una imagen aleatoria
    rotarImagenes();
    // Indicamos que cada 5 segundos cambie la imagen
    setInterval(rotarImagenes,5000);
} 
