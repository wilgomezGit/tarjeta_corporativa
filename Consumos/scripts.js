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

    // Procesar cada línea del archivo
    lines.forEach(line => {
        if (line.trim() !== '') {
            const cardNumber = line.substring(9, 26).trim();
            const rawValue = parseFloat(line.substring(124, 139).replace(/^0+/, '').trim().replace(/,/g, ""));
            const formattedValue = rawValue.toLocaleString('es-ES', { minimumFractionDigits: 2 });
            const date = line.substring(158, 166).trim();
            const uniqueCode = line.substring(333, 341).trim();

            if (!isNaN(rawValue)) {
                data.push({ cardNumber, value: formattedValue, rawValue, date, uniqueCode });
            }
        }
    });

    // Ordenar los datos por fecha
    sortDataByDate();

    // Mostrar los datos en la tabla
    renderTable();

    // Calcular y mostrar el total del valor
    calculateTotal();
}

// Función para ordenar los datos por fecha
function sortDataByDate() {
    data.sort((a, b) => {
        const dateA = `${a.date.slice(0, 4)}${a.date.slice(4, 6)}${a.date.slice(6, 8)}`;
        const dateB = `${b.date.slice(0, 4)}${b.date.slice(4, 6)}${b.date.slice(6, 8)}`;
        return parseInt(dateA) - parseInt(dateB);
    });
}

// Función para mostrar los datos en la tabla
function renderTable() {
    const tableBody = document.getElementById('dataBody');
    tableBody.innerHTML = '';

    const dates = Array.from(new Set(data.map(item => item.date))); // Obtener fechas únicas

    // Mostrar los datos agrupados por fecha
    dates.forEach(date => {
        const filteredData = data.filter(item => item.date === date);
        filteredData.forEach(item => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${item.cardNumber}</td>
                <td>${item.value}</td>
                <td>${item.date}</td>
                <td>${item.uniqueCode}</td>
            `;
        });

        // Insertar una fila para el total de cada fecha
        const total = filteredData.reduce((acc, item) => acc + item.rawValue, 0);
        const totalRow = tableBody.insertRow();
        totalRow.innerHTML = `
            <td colspan="3">Total ${date}</td>
            <td>${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
        `;
        totalRow.style.fontWeight = 'bold';
        totalRow.style.backgroundColor = '#f2f2f2';
    });
}

// Función para calcular el total de todos los datos
function calculateTotal() {
    const totalValue = data.reduce((acc, item) => acc + item.rawValue, 0);
    document.getElementById('totalValue').textContent = totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 });
}

//Función para limpiar la tabla
function clearTable() {
    data = []; // Limpiamos los datos
    document.getElementById('dataBody').innerHTML = '';
    document.getElementById('totalValue').textContent = '';
}

// Función para exportar los datos a CSV
function exportToCSV() {
    if (data.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    const csvContent = "data:text/csv;charset=utf-8,"
        + data.map(item => `${item.cardNumber},${item.rawValue},${item.date},${item.uniqueCode}`).join('\n');

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
        cardNumber: item.cardNumber,
        value: item.rawValue,
        date: item.date,
        uniqueCode: item.uniqueCode
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

