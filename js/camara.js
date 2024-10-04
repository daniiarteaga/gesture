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
let previousX = null; // Posición X anterior para el movimiento
let movementThreshold = 0.05; // Umbral para detectar movimiento significativo

// Función para verificar si un dedo está levantado
function isFingerRaised(landmarks, fingerIndex) {
  return landmarks[fingerIndex].y < landmarks[fingerIndex + 2].y;
}

// Función para detectar cuántos dedos están levantados (índice, corazón, anular)
function getRaisedFingers(landmarks) {
  let raisedFingers = 0;
  
  if (isFingerRaised(landmarks, 8)) raisedFingers++;    // Índice
  if (isFingerRaised(landmarks, 12)) raisedFingers++;   // Corazón
  if (isFingerRaised(landmarks, 16)) raisedFingers++;   // Anular
  
  return raisedFingers;
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
      const raisedFingers = getRaisedFingers(landmarks); // Contamos los dedos levantados

      if (raisedFingers > 0) {
        const currentX = landmarks[8].x; // Usamos la posición X del dedo índice para calcular el movimiento

        if (previousX !== null) {
          const movement = currentX - previousX;

          if (movement < -movementThreshold) {
            // Movimiento de derecha a izquierda
            switch (raisedFingers) {
              case 1:
                console.log("Movimiento derecha a izquierda con 1 dedo (encender LED1)");
                firebase.database().ref('LED/digital').update({ LED1: true })
                  .then(() => {
                    updateButtonState(led1Button, true);
                    console.log('LED1 encendido');
                  })
                  .catch((error) => console.error("Error al encender LED1: ", error));
                break;
              case 2:
                console.log("Movimiento derecha a izquierda con 2 dedos (encender LED2)");
                firebase.database().ref('LED/digital').update({ LED2: true })
                  .then(() => {
                    updateButtonState(led2Button, true);
                    console.log('LED2 encendido');
                  })
                  .catch((error) => console.error("Error al encender LED2: ", error));
                break;
              case 3:
                console.log("Movimiento derecha a izquierda con 3 dedos (encender LED3)");
                firebase.database().ref('LED/digital').update({ LED3: true })
                  .then(() => {
                    updateButtonState(led3Button, true);
                    console.log('LED3 encendido');
                  })
                  .catch((error) => console.error("Error al encender LED3: ", error));
                break;
            }
          } else if (movement > movementThreshold) {
            // Movimiento de izquierda a derecha
            switch (raisedFingers) {
              case 1:
                console.log("Movimiento izquierda a derecha con 1 dedo (apagar LED1)");
                firebase.database().ref('LED/digital').update({ LED1: false })
                  .then(() => {
                    updateButtonState(led1Button, false);
                    console.log('LED1 apagado');
                  })
                  .catch((error) => console.error("Error al apagar LED1: ", error));
                break;
              case 2:
                console.log("Movimiento izquierda a derecha con 2 dedos (apagar LED2)");
                firebase.database().ref('LED/digital').update({ LED2: false })
                  .then(() => {
                    updateButtonState(led2Button, false);
                    console.log('LED2 apagado');
                  })
                  .catch((error) => console.error("Error al apagar LED2: ", error));
                break;
              case 3:
                console.log("Movimiento izquierda a derecha con 3 dedos (apagar LED3)");
                firebase.database().ref('LED/digital').update({ LED3: false })
                  .then(() => {
                    updateButtonState(led3Button, false);
                    console.log('LED3 apagado');
                  })
                  .catch((error) => console.error("Error al apagar LED3: ", error));
                break;
            }
          }
        }

        // Actualizar la posición X anterior
        previousX = currentX;
      } else {
        previousX = null; // Si no hay dedos levantados, resetear la posición
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
