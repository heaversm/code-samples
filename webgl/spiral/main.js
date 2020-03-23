//COMMON FUNCTIONS / UTILS

function mapRange(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function isMobile() {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

//GLOBAL VARS
let siteEmitter, rippleText, spiral //modules
let _width, _height; //window width and height
let gui;
let doAddGUI = false; //when true, show gui for making adjustments to animations

const mainModule = function () {
  //State Vars
  let mousePos, lastMousePosition, maxMouseVariance;

  let mouseIsDown = false;
  let moveCoords = { //keeps track of how far we have moved the mouse while clicking and holding
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  };

  //DOM References
  const $docEl = document.documentElement;
  const $body = document.body;
  const $bgContainer = document.querySelector('.content__container');
  
  //Utils
  const MathUtils = {
    lineEq: (y2, y1, x2, x1, currentVal) => {
      // y = mx + b 
      var m = (y2 - y1) / (x2 - x1), b = y1 - m * x1;
      return m * currentVal + b;
    },
    lerp: (a, b, n) => (1 - n) * a + n * b,
    distance: (x1, x2, y1, y2) => {
      var a = x1 - x2;
      var b = y1 - y2;
      return Math.hypot(a, b);
    }
  };

  function initMain() {
    getDimensions();
    setInitialMousePositions();
    addEmitter();
    addListeners();
    if (doAddGUI){
      addGUI();
    }
    instantiateModules();
    initModules();
  }
  
  function setInitialMousePositions(){
    mousePos = { x: _width / 2, y: _height / 2 }; //set to center
    lastMousePosition = { x: _width / 2, y: _height / 2 };
  }

  function getDimensions() {
    _width = window.innerWidth;
    _height = window.innerHeight;
    maxMouseVariance = Math.max(_width, _height);
  }

  function addEmitter() {
    siteEmitter = new EventEmitter();
  }

  function instantiateModules() {
    rippleText = new rippleTextModule();
    spiral = new spiralModule();
  }

  function initModules() {
    rippleText.init();
    spiral.init();
  }

  function addGUI() {
    gui = new dat.GUI({ width: 300 });
    siteEmitter.emit('guiAdded')
  }

  function addListeners() {
    $bgContainer.addEventListener('mousedown', onBGMouseDown);
    $bgContainer.addEventListener('touchstart', onBGMouseDown);
    $bgContainer.addEventListener('mouseup', onBGMouseUp);
    $bgContainer.addEventListener('touchend', onBGMouseUp);
    $body.addEventListener('mousemove', onBGMouseMove);
    $body.addEventListener('touchmove', onBGMouseMove);
    $bgContainer.addEventListener('mouseleave', onBGMouseLeave); //check to see if a version of this is needed for mobile
    window.addEventListener('resize', onWindowResize);
  }

  function getMousePos(ev) {
    let posx = 0;
    let posy = 0;
    if (!ev) ev = window.event;
    if (ev.pageX || ev.pageY) {
      posx = ev.pageX;
      posy = ev.pageY;
    }
    else if (ev.clientX || ev.clientY) {
      posx = ev.clientX + $body.scrollLeft + $docEl.scrollLeft;
      posy = ev.clientY + $body.scrollTop + $docEl.scrollTop;
    }
    return { x: posx, y: posy };
  }

  function onBGMouseLeave(event) {
    onBGMouseUp(event);
  }

  function onBGMouseDown(event) {
    mouseIsDown = true;
    moveCoords.startX = mousePos.x;
    moveCoords.startY = mousePos.y;
    siteEmitter.emit('handleInteractionStart', {
      mousePosX: mousePos.x,
      mousePosY: mousePos.y,
    });
  }

  function onBGMouseUp(event) {
    siteEmitter.emit('handleInteractionEnd', {
      mousePosX: mousePos.x,
      mousePosY: mousePos.y,
    });
    mouseIsDown = false;
  }

  function onBGMouseMove(ev) {
    mousePos = getMousePos(ev);
    if (mouseIsDown) {
      moveCoords.endX = mousePos.x;
      moveCoords.endY = mousePos.y;
      const mouseDistance = MathUtils.distance(moveCoords.endX, moveCoords.startX, moveCoords.endY, moveCoords.startY);
      const mouseDirection = moveCoords.endX > moveCoords.startX ? 'right' : 'left';
      siteEmitter.emit('handleInteraction', {
        mousePosX: mousePos.x,
        mousePosY: mousePos.y,
        mouseDistance: mouseDistance,
        maxMouseVariance: maxMouseVariance,
        mouseDirection: mouseDirection
      });
    }
  }

  function onWindowResize(){
    getDimensions();
    siteEmitter.emit('handleWindowResize');
  }

  return {
    init: initMain
  }
}

let main;

window.onload = function(){
  main = new mainModule();
  main.init();
}