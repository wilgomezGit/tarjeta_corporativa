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
    const lines = content.split('\n').slice(1); // Saltamos la primera línea (encabezado)

    lines.forEach(line => {
        if (line.trim() !== '') {
            const columns = line.split(';');
            const cedtar = columns[0].trim();
            const nombres = columns[1].trim();
            const bolsillo = columns[2].trim();
            const saldo = parseFloat(columns[3].replace('.', '').replace(',', '.'));

            if (!isNaN(saldo)) {
                data.push({ cedtar, nombres, bolsillo, saldo });
            }
        }
    });

    // Ordenamos los datos por la columna 'BOLSILLO'
    data.sort((a, b) => a.bolsillo.localeCompare(b.bolsillo));

    // Mostramos los datos en la tabla
    renderTable();
}

function renderTable() {
    const tableBody = document.getElementById('dataBody');
    tableBody.innerHTML = '';

    data.forEach(item => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${item.cedtar}</td>
            <td>${item.nombres}</td>
            <td>${item.bolsillo}</td>
            <td>${item.saldo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
        `;
    });
}

function clearTable() {
    data = []; // Limpiamos los datos
    document.getElementById('dataBody').innerHTML = '';
}

function exportToExcel(filteredData, filename) {
    if (filteredData.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    // Mapeamos los datos para eliminar la columna 'saldo'
    const dataWithoutSaldo = filteredData.map(item => ({
        cedtar: item.cedtar,
        nombres: item.nombres,
        bolsillo: item.bolsillo
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataWithoutSaldo, { skipHeader: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    XLSX.writeFile(workbook, filename);
}

function maskCedtar(cedtar) {
    return '******' + cedtar.slice(-3);
}

function exportToFOSFEC() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Restar un día

    const formattedDate = formatDate(yesterday);
    const fileName = `SaldosPagina a ${formattedDate} Fosfec.xlsx`;

    const filteredData = data
        .filter(item => item.bolsillo === 'BONO ALIMENTACION FOSFEC' || item.bolsillo === 'FOSFEC')
        .map(item => ({
            cedtar: maskCedtar(item.cedtar),
            nombres: item.nombres,
            bolsillo: item.bolsillo,
            saldo: item.saldo
        }));

    exportToExcel(filteredData, fileName);
}

function exportToSUBFLIAR() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Restar un día

    const formattedDate = formatDate(yesterday);
    const fileName = `SaldosPagina a ${formattedDate} Subsidio.xlsx`;

    const filteredData = data
        .filter(item => item.bolsillo === 'SUBSIDIO')
        .map(item => ({
            cedtar: maskCedtar(item.cedtar),
            nombres: item.nombres,
            bolsillo: item.bolsillo,
            saldo: item.saldo
        }));

    exportToExcel(filteredData, fileName);
}

function formatDate(date) {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}
