let fileContent = '';
let fileName = '';

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
        fileName = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            fileContent = e.target.result;
            document.getElementById('processButton').disabled = false;
        };
        reader.readAsText(file);
        document.getElementById('fileName').textContent = `Archivo cargado: ${fileName}`;
    } else {
        alert('Por favor, selecciona un archivo de texto (.txt).');
    }
});

document.getElementById('processButton').addEventListener('click', function() {
    if (!fileContent) {
        alert('Por favor cargue un archivo.');
        return;
    }
    validateFileContent(fileContent);
});

document.getElementById('clearButton').addEventListener('click', function() {
    document.getElementById('fileInput').value = '';
    document.getElementById('output').textContent = '';
    document.getElementById('fileName').textContent = '';
    fileContent = '';
    document.getElementById('processButton').disabled = true;
});

function validateFileContent(content) {
    const lines = content.split('\n');
    const expectedLength = 513; // Longitud esperada para cada línea
    const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>¡¿ñÑ\uFFFD]/; // Incluye símbolo de reemplazo
    const tildesRegex = /[áéíóúÁÉÍÓÚ]/;
    let output = 'Los errores se presentan en las siguientes líneas:\n\n';

    let hasErrors = false;

    // Validar todas las líneas excepto la última
    lines.slice(0, -1).forEach((line, index) => {
        const lineNumber = index + 1;

        // Validar longitud de línea
        if (line.length !== expectedLength) {
            output += `<span class="highlight">Línea ${lineNumber} (Longitud incorrecta):</span> ${line}\n\n`;
            hasErrors = true;
        }

        // Validar caracteres especiales y tildes
        if (specialCharactersRegex.test(line) || tildesRegex.test(line)) {
            output += `<span class="highlight">Línea ${lineNumber} (Carácter especial o tilde):</span> ${line}\n\n`;
            hasErrors = true;
        }
    });

    // Si no hay errores, mostrar un mensaje de éxito
    if (!hasErrors) {
        output = 'Archivo procesado sin errores, puede cargarlo a ASOPAGOS.';
    }

    // Mostrar el resultado en el contenedor de salida
    document.getElementById('output').innerHTML = output;
}
