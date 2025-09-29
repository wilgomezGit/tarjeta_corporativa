let data = []; // Variable para almacenar los datos procesados

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
    const lines = content.split('\n');

    // Procesamos todas las líneas excepto las dos últimas
    for (let i = 0; i < lines.length - 2; i++) {
        const line = lines[i].trim();
        if (line !== '') {
            const documentNumber = line.substring(75, 94).trim();
            const value = parseFloat(line.substring(179, 194).replace(/^0+/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',').trim().replace(/,/g, ""));
            const commerce = line.substring(489, 550).trim();

            if (!isNaN(value)) {
                data.push({ documentNumber, value, commerce });
            }
        }
    }

    // Mostramos los datos en la tabla
    renderTable();

    // Calculamos y mostramos el total del valor
    calculateTotal();
}

function renderTable() {
    const tableBody = document.getElementById('dataBody');
    tableBody.innerHTML = '';

    data.forEach(item => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${item.documentNumber}</td>
            <td>${item.value}</td>
            <td>${item.commerce}</td>
        `;
    });
}

function calculateTotal() {
    const totalValue = data.reduce((acc, item) => acc + item.value, 0);

    // Mostrar el total en la tabla (ya existente)
    document.getElementById('totalValue').textContent = totalValue.toLocaleString('de-DE', { minimumFractionDigits: 2 });

    // Mostrar el total en el nuevo div
    document.getElementById('totalProcessedValue').textContent = totalValue.toLocaleString('de-DE', { minimumFractionDigits: 2 });
}

function clearTable() {
    data = []; // Limpiamos los datos
    document.getElementById('dataBody').innerHTML = '';
    document.getElementById('totalValue').textContent = '';
}

function exportToCSV() {
    if (data.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    const csvContent = "data:text/csv;charset=utf-8,"
        + data.map(item => Object.values(item).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "data.csv".
}

function exportToExcel() {
    if (data.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, "data.xlsx");
}


