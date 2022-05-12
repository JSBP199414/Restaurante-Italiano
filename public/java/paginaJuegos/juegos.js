"use strict"
/**---------------------------------------Juego creado con Phaser CE---------------------------------------------*/
//Variable global elementos
var NUMERO_ITEMS = 30;

//Se crea el objeto GamePlayManager 
var GamePlayManager = {
    init: function() {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        
        this.flagFirstMouseDown = false;
        //Variable donde se guardaran los item recolectados
        this.variableItem = 0;
        //Variable finalizar juego
        this.finalJuego = false;
    },
    preload: function() {
      //Cargamos imagenes
        game.load.image('background', '/public/imagenes/juegos/Fondo.jpg');
        game.load.image('chef', '/public/imagenes/juegos/Chef.png');
        //Cargamos imagen spritesheet- division de imagen width-50 heigth-50 3-imagenes
        game.load.spritesheet('items','/public/imagenes/juegos/Pizzas.png', 51, 54, 3);
        game.load.image('explosion', '/public/imagenes/juegos/explosion.png');
    },
    create: function() {
       //Posicion imagenes
        game.add.sprite(0, 0, 'background');
        this.chef = game.add.sprite(0,0,'chef');
        this.chef.x = game.width/2;
        this.chef.y = game.height/2;
        //Anchor de posicionamiento 'chef'
        this.chef.anchor.setTo(0.5); 
        game.input.onDown.add(this.onTap, this);
        
        //Array items
        this.items = [];
        //Direccionamos un numero de items y se agregan a la pantalla
        for(var i=0; i<NUMERO_ITEMS; i++){
            var item = game.add.sprite(100,100,'items');
            //Imagen al azar entre 0 a 3
            item.frame = game.rnd.integerInRange(0,3);
            //Escala de items de 0 a 30
            item.scale.setTo( 0.30 + game.rnd.frac());
            item.anchor.setTo(0.5);
            item.x = game.rnd.integerInRange(50, 1050);
            item.y = game.rnd.integerInRange(50, 600);
            
            this.items[i] = item;
            var rectCurrenDiamond = this.getBoundsItem(item);
            var rectChef = this.getBoundsItem(this.chef);
            
            //While colicionan se cambia de posicion los items creados
            while(this.isOverlapingOtherItem(i, rectCurrenDiamond) || this.isRectanglesOverlapping(rectChef, rectCurrenDiamond) ){
                item.x = game.rnd.integerInRange(50, 1050);
                item.y = game.rnd.integerInRange(50, 600);
                rectCurrenDiamond = this.getBoundsItem(item);
            }
        }
        //Explosion 
        this.explosion = game.add.sprite(100,100,'explosion');
        //Escala de explosion
        this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                        x: [0.4, 0.8, 0.4],
                        y: [0.4, 0.8, 0.4]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);
        
        this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                        alpha: [1, 0.6, 0]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);
        
        this.explosion.anchor.setTo(0.5);
        this.explosion.visible = false;

        //Agregar texto en el juego
        //Coordenadas, position, lectura, style
        this.puntajeInicial = 0;
        var style = {
            font: 'bold 50pt Arial ',
            align:'center',
            fill:'#FFFFFF'
        }
        this.puntajeText = game.add.text(game.width/2, 40, '0', style);
        this.puntajeText.anchor.setTo(0.5);
        
        //Reglas de juego en el juego
        //Coordenadas, position, lectura, styles
        var styles = {
            font: 'bold 17pt Arial ',
            align:'center',
            fill:'rgb(239, 236, 236,0.5)'
        }
        this.textJuego= game.add.text(game.width/1.7, 160, 'Reglas de juego: \n\n\n 1. Recoge todos los items antes que se \n termine el tiempo. \n 2. Si recoge todos los item recibira \n un codigo de descuento \n 3. ¡Buena suerte!!!', styles);
        this.puntajeText.anchor.setTo(0.5);

        //Timer de juego
        //Agregar texto de tiempo en el juego
        this.totalTime = 15;
        this.timerText = game.add.text(1000, 40, this.totalTime+'', style);
        this.timerText.anchor.setTo(0.5);
        
        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
            if(this.flagFirstMouseDown){
                this.totalTime--;
                this.timerText.text = this.totalTime+'';
                if(this.totalTime<=0){
                    game.time.events.remove(this.timerGameOver);
                    this.finalJuego = true;
                    this.mensajeFinal('GAME OVER');
                }
            }
        },this);
    },
    //-----------------------Funcion incrementar puntaje
    incrementarPuntaje:function () {
        this.puntajeInicial += 20;
        this.puntajeText.text = this.puntajeInicial;
        //Generador de codigo automatico al momento de ganar
        const  generateRandomString = (num) => {
            const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result1= Math.random().toString(36).substring(0,num);       
            return result1;
        }
        //Guardamos en una variable el codigo random generado de 7 digitos
       const codigo = generateRandomString(7);
       //console.log(codigo);
        
        //incrementamos variables de Item
            this.variableItem += 1;
            if (this.variableItem >= NUMERO_ITEMS) {
                this.finalJuego = true;
                game.time.events.remove(this.timerGameOver);
                this.mensajeFinal('Felicidades ganaste!!!' +'\n' + 'codigo: '+ codigo);          
            }
            //Guardamos codigo en localSorage
            localStorage.setItem('generateRandomString',codigo); 
            const storageJuego = localStorage.getItem('generateRandomString')
            //console.log(storageJuego); 
        },
        
    //------------------------Funcion mensaje al momento de recolectar todos los item
    mensajeFinal:function (msg) {
        //Diseño fondo de text
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = 'rgb(239, 236, 236)';
        bgAlpha.ctx.fillRect(0,0,game.width, game.height);
        
        var bg = game.add.sprite(0,0,bgAlpha);
        bg.alpha = 0.5;
        
        var style = {
            font: 'bold 60pt Arial',
            fill: '#FFFFFF',
            align: 'center'
          }
        //Diseño text 
        this.textFieldFinalMsg = game.add.text(game.width/2, game.height/2, msg, style);
        this.textFieldFinalMsg.anchor.setTo(0.5);
        },
    //----------------------------Funcion onTap al momento de cliclear el mouse inicia el juego
    onTap:function(){
          this.flagFirstMouseDown = true;
    },
    //----------------------------Funcion de Rectangulo item define el rectangulo de los items
    getBoundsItem:function(currentDiamond){
        return new Phaser.Rectangle(currentDiamond.left, currentDiamond.top, currentDiamond.width, currentDiamond.height);
    },
    //----------------------------Funcion de dos rectangulos- evalua si se sobreponen
    isRectanglesOverlapping: function(rect1, rect2) {
        if(rect1.x> rect2.x+rect2.width || rect2.x> rect1.x+rect1.width){
            return false;
        }
        if(rect1.y> rect2.y+rect2.height || rect2.y> rect1.y+rect1.height){
            return false;
        }
        return true;
    },
    //---------------------------Funcion comparacion si colicionan los items
    isOverlapingOtherItem:function(index, rect2){
        for(var i=0; i<index; i++){
            var rect1 = this.getBoundsItem(this.items[i]);
            if(this.isRectanglesOverlapping(rect1, rect2)){
                return true;
            }
        }
        return false;
    },
    //---------------------------Funcion rectangulo de imagen 'chef'
    getBoundsChef:function(){
        var x0 = this.chef.x - Math.abs(this.chef.width)/4;
        var width = Math.abs(this.chef.width)/2;
        var y0 = this.chef.y - this.chef.height/2;
        var height = this.chef.height;
        //Retorna un nuevo rectangulo
        return new Phaser.Rectangle(x0, y0,width,height);
    },
    //---------------------------Funcion visualizar los items y chef 
    render:function(){
        //game.debug.spriteBounds(this.horse);
        for(var i=0; i<NUMERO_ITEMS; i++){
            //game.debug.spriteBounds(this.diamonds[i]);
        }
    },
    update: function() {
        if(this.flagFirstMouseDown && !this.finalJuego){
            //Movimiento de imagen 'chef'
            var pointerX = game.input.x;
            var pointerY = game.input.y;
            //Distancia de posicion 'chef'
            var distX = pointerX - this.chef.x;
            var distY = pointerY - this.chef.y;
            //Movimieto en x 
            if(distX>0){
                this.chef.scale.setTo(1,1);
            }else{
                this.chef.scale.setTo(-1,1);
        }
            //Velocidad de desplazamiento          
            this.chef.x += distX * 0.02;
            this.chef.y += distY * 0.02;
            
            //compara si colicionan 'chef' y 'items'
            for(var i=0; i<NUMERO_ITEMS; i++){
                var rectChef = this.getBoundsChef();
                var rectItem = this.getBoundsItem(this.items[i]);
                
                //Visibilidad explosion y items
                if(this.items[i].visible && this.isRectanglesOverlapping(rectChef, rectItem)){
                    this.items[i].visible = false;
                    this.incrementarPuntaje();
                    
                    this.explosion.visible = true;
                    this.explosion.x = this.items[i].x;
                    this.explosion.y = this.items[i].y;
                    this.explosion.tweenScale.start();
                    this.explosion.tweenAlpha.start();
                }
            }
        }
        
    }
}
//Dimensiones del juego
var game = new Phaser.Game(1136, 640, Phaser.CANVAS, 'game');
//Estado 'gameplay' asignado a un objeto GameplayManager    
game.state.add("gameplay", GamePlayManager);
//Iniciamos el 'gameplay'
game.state.start("gameplay");

