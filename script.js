// ------------ REPOSITORIO DE EJEMPLO ------------

/* https://github.com/digitalhouse-content/login-validado-javascript */

// ------------ 1 MOCKUP ------------

/* password, localStorage, JSON, favicon */
/* confirmar, mostrar / ocultar contraseña */
/* guardar mail en localStorage */

// ------------ 2 STYLING ------------

/* flex, align-items / height, float / transition */

// ------------ 3 VALIDATION ------------

/* formato email / contraseña, igualdad contraseñas */
/* addEventListener, DOMContentLoaded, change / blur / submit  */

async function obtenerSHA256(mensaje) {
	const messageBuffer = new TextEncoder().encode(mensaje);
	let hashedMessage = await crypto.subtle.digest("SHA-256", messageBuffer);
	let hexHash = Array.from(new Uint8Array(hashedMessage))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
	return hexHash;
}

// Inicializar base de usuarios

if (!localStorage.getItem("users")) {
	localStorage.setItem("users", JSON.stringify([]));
}

function obtenerUsuarios() {
	let usuarios = new Array();
	usuarios = JSON.parse(localStorage.getItem("users"));
	return usuarios;
}

function agregarUsuario(usuario) {
	let usuarios = obtenerUsuarios();
	usuarios.push(usuario);
	localStorage.setItem("users", JSON.stringify(usuarios));
}

function obtenerUsuario(email) {
	return obtenerUsuarios().find((user) => user.email === email);
}

async function validarDatosAutenticacion(email, contrasena) {
	let usuario = obtenerUsuario(email);
	if (usuario) {
		hashAComparar = await obtenerSHA256(contrasena);
		let contrasenasCoinciden = hashAComparar === usuario.password;
		console.assert(contrasenasCoinciden, "Contraseña incorrecta");
		return contrasenasCoinciden;
	} else {
		console.log("Usuario no existe");
		return false;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const FORM = document.forms["login-form"];
	const SUBMIT_BUTTON = document.querySelector(
		"#login-form input[type='submit']"
	);

	const EMAIL = document.getElementById("login-email");
	const EMAIL_ERROR = document.getElementById("error-email");
	const REGEX_MAIL = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

	const PASSWORD = document.getElementById("login-password");
	const PASSWORD_ERROR = document.getElementById("error-password");
	const REGEX_PASSWORD =
		/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[-_!@#\$%\^&\*]).{8,}$/;
	const PASSWORD_REQUIREMENTS = `
    <ul>
        <li>Mínimo 8 caracteres</li>
        <li>Una mayúscula</li>
        <li>Una minúscula</li>
        <li>Un número</li>
        <li>Un caracter especial (-_!@#$%^&*)</li>
    </ul>`;

	const PASSWORD_CONFIRM = document.getElementById("login-password-confirm");
	const PASSWORD_CONFIRM_ERROR = document.getElementById(
		"error-password-confirm"
	);
	const PASSWORD_CONFIRM_LABEL = document.querySelector(
		"label[for='login-password-confirm']"
	);

	const PASSWORD_TOGGLE = document.getElementById("toggle-password");
	const ACTION_TOGGLE = document.getElementById("action-toggle");

	const ACCION_REGISTRO = {
		codigo: "REGISTRO",
		etiqueta: "Registrarme",
		etiquetaBotonSecundario: "Ya tengo cuenta",
		handler: registrarUsuario,
	};

	const ACCION_AUTENTICACION = {
		codigo: "AUTENTICACION",
		etiqueta: "Ingresar",
		etiquetaBotonSecundario: "Crear cuenta",
		handler: autenticarUsuario,
	};

	function mostrarError(elemento, texto) {
		elemento.innerHTML = texto;
	}

	function ocultarError(elemento) {
		elemento.innerHTML = "";
	}

	// Validar mail al abandonar campo mail

	function validarEmail() {
		let campoValido = true;
		if (REGEX_MAIL.test(EMAIL.value)) {
			ocultarError(EMAIL_ERROR);
		} else {
			mostrarError(EMAIL_ERROR, "Ingresa un email con formato válido");
			campoValido = false;
		}
		return campoValido;
	}

	EMAIL.addEventListener("blur", () => {
		validarEmail();
	});

	// Validar contraseña al abandonar campo contraseña

	function validarContrasena() {
		let campoValido = true;
		if (REGEX_PASSWORD.test(PASSWORD.value)) {
			ocultarError(PASSWORD_ERROR);
		} else {
			mostrarError(
				PASSWORD_ERROR,
				`La contraseña debe contener: ${PASSWORD_REQUIREMENTS}`
			);
			campoValido = false;
		}
		return campoValido;
	}

	PASSWORD.addEventListener("blur", validarContrasena);

	// Igualar contraseñas al abandonar campo confirm

	function validarConfirmacionContrasena() {
		let campoValido = true;
		if (PASSWORD.value === PASSWORD_CONFIRM.value) {
			ocultarError(PASSWORD_CONFIRM_ERROR);
		} else {
			mostrarError(
				PASSWORD_CONFIRM_ERROR,
				"Valida que ambas contraseñas coincidan"
			);
			campoValido = false;
		}
		return campoValido;
	}

	PASSWORD_CONFIRM.addEventListener("blur", validarConfirmacionContrasena);

	// Mostrar / ocultar contraseña

	function ocultarContrasenas() {
		PASSWORD.type = "password";
		PASSWORD_CONFIRM.type = "password";
	}

	function toggleContrasenas() {
		PASSWORD.type = PASSWORD.type === "password" ? "text" : "password";
		PASSWORD_CONFIRM.type =
			PASSWORD_CONFIRM.type === "password" ? "text" : "password";
	}

	PASSWORD_TOGGLE.addEventListener("click", toggleContrasenas);

	// Validar y guardar info en localStorage

	async function crearUsuario() {
		let hexPassword = await obtenerSHA256(PASSWORD.value);
		return {
			email: EMAIL.value.trim(),
			password: hexPassword,
		};
	}

	function registrarUsuario(event) {
		event.preventDefault();
		let formValido =
			validarEmail() &&
			validarContrasena() &&
			validarConfirmacionContrasena();
		if (formValido) {
			if (obtenerUsuario(EMAIL.value.trim())) {
				alert("Ya existe un usuario con el email ingresado.");
			} else {
				crearUsuario().then((usuario) => {
					agregarUsuario(usuario);
					console.group(
						"Nuevo usuario agregado a almacenamiento local"
					);
					console.log(usuario);
					console.groupEnd();
					alert(
						`Genial! Ahora puedes ingresar tocando en '${ACCION_REGISTRO.etiquetaBotonSecundario}' :D`
					);
				});
			}
		} else {
			alert("Valida los datos ingresados y vuelve a intentarlo");
		}
	}

	// Handler para Autenticacion

	function autenticarUsuario(event) {
		event.preventDefault();
		validarDatosAutenticacion(EMAIL.value.trim(), PASSWORD.value).then(
			(sesionValida) => {
				alert(
					sesionValida
						? "Genial! Ya puedes recorrer nuestra plataforma :D"
						: "Valida los datos ingresados y vuelve a intentarlo"
				);
			}
		);
	}

	function activarModoAutenticacion() {

		document.title = "LOGIN 2.0 - Autenticación";

		localStorage.setItem("accionActual", ACCION_AUTENTICACION.codigo);

		PASSWORD_CONFIRM_LABEL.style.display = "none";
		PASSWORD_CONFIRM.style.display = "none";
		PASSWORD_CONFIRM.value = "";
		ocultarError(PASSWORD_CONFIRM_ERROR);

		PASSWORD.value = "";
		PASSWORD.removeEventListener("blur", validarContrasena);
		ocultarError(PASSWORD_ERROR);

		ocultarContrasenas();

		SUBMIT_BUTTON.value = ACCION_AUTENTICACION.etiqueta;
		FORM.onsubmit = ACCION_AUTENTICACION.handler;
		ACTION_TOGGLE.textContent =
			ACCION_AUTENTICACION.etiquetaBotonSecundario;
	}

	function activarModoRegistro() {

		document.title = "LOGIN 2.0 - Registro";
		localStorage.setItem("accionActual", ACCION_REGISTRO.codigo);

		PASSWORD_CONFIRM_LABEL.style.display = "block";
		PASSWORD_CONFIRM.style.display = "block";

		PASSWORD.value = "";
		PASSWORD.addEventListener("blur", validarContrasena);
		ocultarError(PASSWORD_ERROR);

		ocultarContrasenas();

		SUBMIT_BUTTON.value = ACCION_REGISTRO.etiqueta;
		FORM.onsubmit = ACCION_REGISTRO.handler;
		ACTION_TOGGLE.textContent = ACCION_REGISTRO.etiquetaBotonSecundario;
	}

	activarModoAutenticacion();

	// Alternar entre Autenticacion y Registro

	ACTION_TOGGLE.addEventListener("click", () => {
		if (localStorage.getItem("accionActual") === ACCION_REGISTRO.codigo) {
			activarModoAutenticacion();
		} else {
			activarModoRegistro();
		}
	});
});
