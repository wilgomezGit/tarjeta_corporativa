let fileContent = '';
let fileName = '';

document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file && file.type === 'text/plain') {
        fileName = file.name;
        const reader = new FileReader();

        reader.onload = function (e) {
            fileContent = e.target.result;
            document.getElementById('processButton').disabled = false;
        };

        reader.readAsText(file);
        document.getElementById('fileName').textContent = `Archivo cargado: ${fileName}`;
    } else {
        alert('Por favor, selecciona un archivo de texto (.txt).');
    }
});

document.getElementById('processButton').addEventListener('click', function () {
    if (!fileContent) {
        alert('Por favor cargue un archivo.');
        return;
    }
    validateFileContent(fileContent);
});

document.getElementById('clearButton').addEventListener('click', function () {
    document.getElementById('fileInput').value = '';
    document.getElementById('output').textContent = '';
    document.getElementById('fileName').textContent = '';
    fileContent = '';
    document.getElementById('processButton').disabled = true;
});

function validateFileContent(content) {
    const lines = content.split('\n');
    const expectedLength = 513;

    // Solo permite letras, números y espacios
    const invalidCharactersRegex = /[^A-Za-z0-9 ]/g;

    let output = 'Los errores se presentan en las siguientes líneas:\n\n';
    let hasErrors = false;

    lines.slice(0, -1).forEach((rawLine, index) => {

        // Elimina caracteres invisibles (\r de Windows)
        const line = rawLine.replace(/\r/g, '');
        const lineNumber = index + 1;

        // Validar longitud
        if (line.length !== expectedLength) {
            output += `<span class="highlight">Línea ${lineNumber} (Longitud incorrecta):</span> ${line}\n\n`;
            hasErrors = true;
        }

        // Validar caracteres no permitidos
        if (invalidCharactersRegex.test(line)) {
            const highlightedLine = line.replace(
                invalidCharactersRegex,
                match => `<span class="error">${match}</span>`
            );

            output += `<span class="highlight">Línea ${lineNumber} (Carácter no permitido):</span> ${highlightedLine}\n\n`;
            hasErrors = true;
        }
    });

    if (!hasErrors) {
        output = 'Archivo procesado sin errores, puede cargarlo a ASOPAGOS.';
    }

    document.getElementById('output').innerHTML = output;
}
