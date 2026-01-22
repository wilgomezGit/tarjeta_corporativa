// Variables globales para almacenar el contenido y nombre del archivo
let fileContent = '';
let fileName = '';

/* =========================================================
   EVENTO: CUANDO EL USUARIO SELECCIONA UN ARCHIVO
   ========================================================= */
document.getElementById('fileInput').addEventListener('change', function(event) {

    // Obtiene el primer archivo seleccionado
    const file = event.target.files[0];

    // Valida que exista y que sea un archivo de texto plano (.txt)
    if (file && file.type === 'text/plain') {

        // Guarda el nombre del archivo
        fileName = file.name;

        // Crea un lector de archivos
        const reader = new FileReader();

        // Se ejecuta cuando el archivo termina de cargarse
        reader.onload = function(e) {
            // Guarda el contenido completo del archivo
            fileContent = e.target.result;

            // Habilita el botón de procesar
            document.getElementById('processButton').disabled = false;
        };

        // Lee el archivo como texto
        reader.readAsText(file);

        // Muestra el nombre del archivo cargado en pantalla
        document.getElementById('fileName').textContent = `Archivo cargado: ${fileName}`;

    } else {
        // Muestra alerta si no es un archivo .txt
        alert('Por favor, selecciona un archivo de texto (.txt).');
    }
});

/* =========================================================
   EVENTO: BOTÓN PROCESAR
   ========================================================= */
document.getElementById('processButton').addEventListener('click', function() {

    // Verifica que el archivo tenga contenido
    if (!fileContent) {
        alert('Por favor cargue un archivo.');
        return;
    }

    // Llama a la función que valida el contenido del archivo
    validateFileContent(fileContent);
});

/* =========================================================
   EVENTO: BOTÓN LIMPIAR
   ========================================================= */
document.getElementById('clearButton').addEventListener('click', function() {

    // Limpia el input file
    document.getElementById('fileInput').value = '';

    // Limpia el área de salida
    document.getElementById('output').textContent = '';

    // Limpia el nombre del archivo
    document.getElementById('fileName').textContent = '';

    // Resetea el contenido del archivo
    fileContent = '';

    // Deshabilita nuevamente el botón procesar
    document.getElementById('processButton').disabled = true;
});

/* =========================================================
   FUNCIÓN PRINCIPAL DE VALIDACIÓN DEL ARCHIVO
   ========================================================= */
function validateFileContent(content) {

    // Divide el archivo en líneas
    const lines = content.split('\n');

    // Longitud exacta que debe tener cada línea
    const expectedLength = 513;

    // Regex que detecta CUALQUIER carácter NO permitido
    // Solo permite: letras (A-Z, a-z), números (0-9) y espacio
    const invalidCharactersRegex = /[^A-Za-z0-9 ]/;

    // Texto inicial del resultado
    let output = 'Los errores se presentan en las siguientes líneas:\n\n';

    // Bandera para saber si hay errores
    let hasErrors = false;

    /* =====================================================
       RECORRE TODAS LAS LÍNEAS MENOS LA ÚLTIMA
       ===================================================== */
    lines.slice(0, -1).forEach((line, index) => {

        // Número de línea real (empieza en 1)
        const lineNumber = index + 1;

        /* ---------- VALIDACIÓN DE LONGITUD ---------- */
        if (line.length !== expectedLength) {
            output += `<span class="highlight">Línea ${lineNumber} (Longitud incorrecta):</span> ${line}\n\n`;
            hasErrors = true;
        }

        /* ---------- VALIDACIÓN DE CARACTERES ---------- */
        if (invalidCharactersRegex.test(line)) {
            output += `<span class="highlight">Línea ${lineNumber} (Contiene símbolos o caracteres no permitidos):</span> ${line}\n\n`;
            hasErrors = true;
        }
    });

    /* =====================================================
       RESULTADO FINAL
       ===================================================== */
    if (!hasErrors) {
        // Mensaje si el archivo no tiene errores
        output = 'Archivo procesado sin errores, puede cargarlo a ASOPAGOS.';
    }

    // Muestra el resultado en pantalla
    document.getElementById('output').innerHTML = output;
}
