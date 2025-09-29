let dataFile1 = [];
let dataFile2 = [];
let errores = []; // ahora es global para poder exportarlo

// Leer archivo Excel y extraer por columnas específicas
function readExcel(file, fileNumber, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let filtered = [];
        rows.slice(1).forEach(row => { // saltar cabecera
            if (fileNumber === 1) {
                // Archivo 1 → B (col 1) y J (col 9)
                const documento = row[1];
                const saldo = row[9];
                if (documento && saldo !== undefined && saldo !== null) {
                    filtered.push({
                        documento: String(documento).trim(),
                        saldo: Number(saldo) || 0
                    });
                }
            } else {
                // Archivo 2 → A (col 0) y B (col 1)
                const documento = row[0];
                const saldo = row[1];
                if (documento && saldo !== undefined && saldo !== null) {
                    filtered.push({
                        documento: String(documento).trim(),
                        saldo: Number(saldo) || 0
                    });
                }
            }
        });

        callback(filtered);
    };
    reader.readAsArrayBuffer(file);
}

// Eventos de carga de archivos
document.getElementById("fileInput1").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        readExcel(file, 1, (data) => {
            dataFile1 = data;
            checkReady();
        });
    }
});

document.getElementById("fileInput2").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        readExcel(file, 2, (data) => {
            dataFile2 = data;
            checkReady();
        });
    }
});

// Habilitar botón cuando ambos archivos estén listos
function checkReady() {
    if (dataFile1.length > 0 && dataFile2.length > 0) {
        document.getElementById("processButton").disabled = false;
    }
}

// Botón Conciliar
document.getElementById("processButton").addEventListener("click", function() {
    conciliar();
});

function conciliar() {
    errores = [];
    let correctos = 0;

    dataFile1.forEach(item1 => {
        const match = dataFile2.find(item2 => item2.documento == item1.documento);
        if (match) {
            const diferencia = item1.saldo - match.saldo;
            if (diferencia !== 0) {
                errores.push({
                    Documento: item1.documento,
                    "Saldo Archivo 1": item1.saldo,
                    "Saldo Archivo 2": match.saldo,
                    Diferencia: diferencia
                });
            } else {
                correctos++;
            }
        } else {
            errores.push({
                Documento: item1.documento,
                "Saldo Archivo 1": item1.saldo,
                "Saldo Archivo 2": "No encontrado",
                Diferencia: "N/A"
            });
        }
    });

    let output = "";

    // Resumen
    output += `<p><strong>Resumen:</strong><br>
                Documentos conciliados correctamente: ${correctos}<br>
                Documentos con error: ${errores.length}</p>`;

    // Detalle de errores
    if (errores.length === 0) {
        output += "<p><strong>✅ Todos los documentos conciliaron correctamente.</strong></p>";
        document.getElementById("exportButton").style.display = "none";
    } else {
        output += "<table border='1' cellpadding='5' style='border-collapse:collapse;width:100%'>" +
                 "<tr><th>Documento</th><th>Saldo Archivo 1</th><th>Saldo Archivo 2</th><th>Diferencia</th></tr>";
        errores.forEach(err => {
            output += `<tr>
                <td>${err.Documento}</td>
                <td>${err["Saldo Archivo 1"]}</td>
                <td>${err["Saldo Archivo 2"]}</td>
                <td style="color:red;font-weight:bold;">${err.Diferencia}</td>
            </tr>`;
        });
        output += "</table>";
        document.getElementById("exportButton").style.display = "inline-block";
    }

    document.getElementById("output").innerHTML = output;
}

// Botón Exportar
document.getElementById("exportButton").addEventListener("click", function() {
    if (errores.length === 0) {
        alert("No hay errores para exportar.");
        return;
    }
    const ws = XLSX.utils.json_to_sheet(errores);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errores");
    XLSX.writeFile(wb, "errores_conciliacion.xlsx");
});

// Botón Cancelar
document.getElementById("clearButton").addEventListener("click", function() {
    document.getElementById("fileInput1").value = "";
    document.getElementById("fileInput2").value = "";
    document.getElementById("output").innerHTML = "";
    document.getElementById("processButton").disabled = true;
    document.getElementById("exportButton").style.display = "none";
    dataFile1 = [];
    dataFile2 = [];
    errores = [];
});
