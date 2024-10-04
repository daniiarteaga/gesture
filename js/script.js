// Inicializar Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDT_tN-WoNI-urQSONs-_UkbVLi-0G8urQ",
    authDomain: "esp32-79ad7.firebaseapp.com",
    databaseURL: "https://esp32-79ad7-default-rtdb.firebaseio.com",
    projectId: "esp32-79ad7",
    storageBucket: "esp32-79ad7.appspot.com",
    messagingSenderId: "877594980004",
    appId: "1:877594980004:web:89119b8733f61810e6c031"
};

firebase.initializeApp(firebaseConfig);

function logoutUser() {
    firebase.auth().signOut().then(() => {
        alert("Deslogueo exitoso");
        window.location.href = "index.html";
    }).catch((error) => {
        alert(`Error: ${error.message}`);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");
    
    const registerForm = document.querySelector("#register-form");
    const loginForm = document.querySelector("#login-form");
    const logoutButton = document.getElementById("logout-button");
    
    // Solo añade event listeners si los formularios están presentes
    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    }
    
    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }
    
    if (logoutButton) {
        logoutButton.addEventListener("click", logoutUser);
    }

    firebase.auth().onAuthStateChanged((user) => {
        console.log("Auth state changed:", user);
        const userStatus = document.getElementById("user-status");
        if (user) {
            userStatus.textContent = `Hola, ${user.email}`;
            if (logoutButton) {
                logoutButton.style.display = "inline";
            }
        } else {
            userStatus.textContent = "No has iniciado sesion";
            if (logoutButton) {
                logoutButton.style.display = "none";
            }
        }
    });
});

function registerUser(event) {
    event.preventDefault();
    const email = document.querySelector("#register-email").value;
    const password = document.querySelector("#register-password").value;

    // Validar contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]{8,}$/;
    if (!passwordRegex.test(password)) {
        alert("La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.");
        return;
    }
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Registro exitoso");
        })
        .catch((error) => {
            alert(`Error: ${error.message}`);
        });
}

function loginUser(event) {
    event.preventDefault();
    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-password").value;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Inicio de sesión exitoso");
        })
        .catch((error) => {
            alert(`Error: ${error.message}`);
        });
}

// Function to toggle menu
function openNav() {
    const user = firebase.auth().currentUser;
    if (user) {
        document.getElementById("myNav").classList.toggle("menu_width"); // Alterna la clase "menu_width" en el elemento con id "myNav"
        document.querySelector(".custom_menu-btn").classList.toggle("menu_btn-style"); // Alterna la clase "menu_btn-style" en el botón de menú personalizado
    } else {
        alert("Por favor, inicie sesión para acceder al menú.");
    }
}

// Verificar si el usuario está autenticado
firebase.auth().onAuthStateChanged((user) => {
    const userStatus = document.getElementById("user-status"); // Elemento para mostrar el estado del usuario
    const logoutButton = document.getElementById("logout-button"); // Botón de logout
    const gestosLink = document.getElementById("gestos-link"); // Enlace a la página de gestos
    const authStatus = document.getElementById("auth-status"); // Contenedor de estado de autenticación

    if (user) { // Si hay un usuario autenticado
        userStatus.textContent = `Hola, ${user.email}`; // Mostrar mensaje de bienvenida con el correo del usuario
        logoutButton.style.display = "inline"; // Mostrar el botón de logout
        gestosLink.style.display = "block"; // Mostrar el enlace a la página de gestos
        authStatus.style.display = "block"; // Mostrar el contenedor de estado de autenticación
    } else { // Si no hay usuario autenticado
        userStatus.textContent = "No has iniciado sesión"; // Mostrar mensaje de que no ha iniciado sesión
        logoutButton.style.display = "none"; // Ocultar el botón de logout
        gestosLink.style.display = "none"; // Ocultar el enlace a la página de gestos
        authStatus.style.display = "none"; // Ocultar el contenedor de estado de autenticación
    }
});
