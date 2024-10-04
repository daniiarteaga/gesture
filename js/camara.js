// Obtener elementos de los botones
const led1Button = document.getElementById('toggle-led1');
const led2Button = document.getElementById('toggle-led2');
const led3Button = document.getElementById('toggle-led3');

// Función para actualizar el estado del botón y el estilo
function updateButtonState(button, isEnabled) {
  if (isEnabled) {
    button.classList.add('button-on'); // Agrega la clase 'button-on' para estilo activado
    button.classList.remove('button-off'); // Remueve la clase 'button-off' para estilo desactivado
  } else {
    button.classList.add('button-off'); // Agrega la clase 'button-off' para estilo desactivado
    button.classList.remove('button-on'); // Remueve la clase 'button-on' para estilo activado
  }
}

// Variables para controlar el estado de los LEDs
let previousX = null; // Posición X anterior para el movimiento horizontal
let previousY = null; // Posición Y anterior para el movimiento vertical
let movementThresholdX = 0.02; // Umbral para detectar movimiento horizontal significativo
let movementThresholdY = 0.02; // Umbral para detectar movimiento vertical significativo

// Función para verificar si un dedo está levantado
function isFingerRaised(landmarks, fingerIndex) {
  return landmarks[fingerIndex].y < landmarks[fingerIndex + 2].y;
}
// Elementos de la cámara y el canvas
const videoElement = document.querySelector('.input_video');
const canvasElement = document.querySelector('.output_canvas');
const canvasCtx = canvasElement.getContext('2d');
// Función para manejar los resultados del detector de manos
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const landmarks = results.multiHandLandmarks[index];

      // Verificamos si el dedo índice está levantado
      if (isFingerRaised(landmarks, 8)) {
        const currentX = landmarks[8].x; // Posición X del dedo índice
        const currentY = landmarks[8].y; // Posición Y del dedo índice

        // Detectar movimiento horizontal (X) para el LED1
        if (previousX !== null) {
          const movementX = currentX - previousX;

          if (movementX > movementThresholdX) {
            // Movimiento de izquierda a derecha (enciende LED1)
            console.log("Movimiento izquierda a derecha (encender LED1)");
            firebase.database().ref('LED/digital').update({ LED1: true })
              .then(() => {
                updateButtonState(led1Button, true);
                console.log('LED1 encendido');
              })
              .catch((error) => console.error("Error al encender LED1: ", error));
          } else if (movementX < -movementThresholdX) {
            // Movimiento de derecha a izquierda (apaga LED1)
            console.log("Movimiento derecha a izquierda (apagar LED1)");
            firebase.database().ref('LED/digital').update({ LED1: false })
              .then(() => {
                updateButtonState(led1Button, false);
                console.log('LED1 apagado');
              })
              .catch((error) => console.error("Error al apagar LED1: ", error));
          }
        }

        // Detectar movimiento vertical (Y) para el LED2
        if (previousY !== null) {
          const movementY = currentY - previousY;

          if (movementY < -movementThresholdY) {
            // Movimiento de abajo a arriba (enciende LED2)
            console.log("Movimiento de abajo a arriba (encender LED2)");
            firebase.database().ref('LED/digital').update({ LED2: true })
              .then(() => {
                updateButtonState(led2Button, true);
                console.log('LED2 encendido');
              })
              .catch((error) => console.error("Error al encender LED2: ", error));
          } else if (movementY > movementThresholdY) {
            // Movimiento de arriba a abajo (apaga LED2)
            console.log("Movimiento de arriba a abajo (apagar LED2)");
            firebase.database().ref('LED/digital').update({ LED2: false })
              .then(() => {
                updateButtonState(led2Button, false);
                console.log('LED2 apagado');
              })
              .catch((error) => console.error("Error al apagar LED2: ", error));
          }
        }

        // Actualizar las posiciones previas
        previousX = currentX;
        previousY = currentY;
      } else {
        previousX = null; // Si el dedo índice no está levantado, reiniciamos
        previousY = null;
      }
    }
  }

  canvasCtx.restore();
}

// Inicializar el detector de manos
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
  }
});
hands.onResults(onResults);

// Inicializar la cámara
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
});
camera.start();
