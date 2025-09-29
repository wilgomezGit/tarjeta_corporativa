let data = []; // Variable para almacenar los datos procesados
let lastLineData = null; // Variable para almacenar la última línea
let totalValue = 0; // Variable para almacenar la suma total del valor

function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor selecciona un archivo.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        processData(content);
    };
    reader.readAsText(file);
}

function processData(content) {
    data = []; // Limpiamos los datos anteriores
    totalValue = 0; // Reiniciamos el valor total
    const lines = content.split('\n');

    // Limpiar el contenedor de duplicados
    const duplicatesContainer = document.getElementById('duplicatesContainer');
    duplicatesContainer.innerHTML = '';

    const documentNumbers = [];
    const cardNumbers = [];
    const lineNumbersForDocuments = {};
    const lineNumbersForCards = {};

    // Procesar cada línea del archivo excepto la última
    lines.forEach((line, index) => {
        if (index < lines.length - 1 && line.trim() !== '') {
            const documentNumber = line.substring(30, 45).replace(/^0+/, '').trim();
            const cardNumber = line.substring(64, 81).trim();
            const rawValue = parseFloat(line.substring(83, 99).replace(/^0+/, '').trim().replace(/,/g, ""));
            const formattedValue = rawValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 });

            if (!isNaN(rawValue)) {
                data.push({ documentNumber, cardNumber, value: formattedValue });
                totalValue += rawValue; // Sumar al total

                // Registrar las líneas para cada número
                if (!lineNumbersForDocuments[documentNumber]) {
                    lineNumbersForDocuments[documentNumber] = [];
                }
                lineNumbersForDocuments[documentNumber].push(index + 1); // Línea actualizada (1-based index)

                if (!lineNumbersForCards[cardNumber]) {
                    lineNumbersForCards[cardNumber] = [];
                }
                lineNumbersForCards[cardNumber].push(index + 1); // Línea actualizada (1-based index)

                // Añadir números a la lista para búsqueda de duplicados
                documentNumbers.push(documentNumber);
                cardNumbers.push(cardNumber);
            }
        }

        // Validar la última línea del archivo
        if (index === lines.length - 1 && line.trim() !== '') {
            lastLineData = parseFloat(line.substring(68, 85).replace(/^0+/, '').trim().replace(/,/g, ""));
        }
    });

    // Mostrar los datos en la tabla
    renderTable();

    // Mostrar la última línea validada
    renderLastLine();

    // Mostrar el total de la columna Valor
    displayTotal();

    // Verificar duplicados
    checkDuplicates(documentNumbers, cardNumbers, lineNumbersForDocuments, lineNumbersForCards);
}

function renderTable() {
    const tableBody = document.getElementById('dataBody');
    tableBody.innerHTML = '';

    // Mostrar los datos en la tabla
    data.forEach((item, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td> <!-- Número de la línea -->
            <td>${item.documentNumber}</td>
            <td>${item.cardNumber}</td>
            <td>${item.value}</td>
        `;
    });
}


function renderLastLine() {
    const lastLineContainer = document.getElementById('lastLineContainer');
    lastLineContainer.innerHTML = `<div style="text-align: center;">Valor de la última línea: ${lastLineData.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 })}</div>`;
}

function displayTotal() {
    const totalValueContainer = document.getElementById('totalValue');
    totalValueContainer.textContent = `Total: ${totalValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 })}`;
}

function checkDuplicates(documentNumbers, cardNumbers, lineNumbersForDocuments, lineNumbersForCards) {
    const duplicateDocuments = findDuplicates(documentNumbers);
    const duplicateCards = findDuplicates(cardNumbers);

    let message = '';
    if (duplicateDocuments.length > 0 || duplicateCards.length > 0) {
        message += duplicateDocuments.length > 0 ? `Números de documentos Duplicados:\n\n` : '';
        duplicateDocuments.forEach(doc => {
            message += `Número de documento: ${doc}, líneas: ${lineNumbersForDocuments[doc].join(', ')}\n`;
        });
        message += duplicateCards.length > 0 ? `\nNúmeros de Tarjeta Duplicados:\n\n` : '';
        duplicateCards.forEach(card => {
            message += `Número de tarjeta: ${card}, líneas: ${lineNumbersForCards[card].join(', ')}\n`;
        });
        document.getElementById('duplicatesContainer').innerText = message;
    } else {
        document.getElementById('duplicatesContainer').innerText = 'No se encontraron duplicados, Archivo correcto';
    }
}

function findDuplicates(arr) {
    const counts = {};
    const duplicates = [];
    arr.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
        if (counts[item] === 2) {
            duplicates.push(item);
        }
    });
    return duplicates;
}

// Función para limpiar la tabla
function clearTable() {
    data = []; // Limpiamos los datos
    lastLineData = null; // Limpiamos la última línea
    totalValue = 0; // Reiniciamos el total
    document.getElementById('dataBody').innerHTML = '';
    document.getElementById('totalValue').textContent = '';
    document.getElementById('lastLineContainer').innerHTML = '';
    document.getElementById('duplicatesContainer').innerHTML = ''; // Limpiar duplicados
}

// Función para exportar los datos a CSV
function exportToCSV() {
    if (data.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    const csvContent = "data:text/csv;charset=utf-8,"
        + data.map(item => `${item.documentNumber},${item.cardNumber},${item.value}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link); // Requerido para Firefox

    link.click(); // Esto descargará el archivo de datos llamado "data.csv"
}

// Función para exportar los datos a Excel
function exportToExcel() {
    if (data.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
        documentNumber: item.documentNumber,
        cardNumber: item.cardNumber,
        value: item.value
    })));
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data.xlsx');
    document.body.appendChild(link); // Requerido para Firefox

    link.click(); // Esto descargará el archivo de datos llamado "data.xlsx"
    document.body.removeChild(link); // Limpiar
}
