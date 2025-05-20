
document.addEventListener('DOMContentLoaded', () => {
    const schedaForm = document.getElementById('schedaForm');
    const exportCSV = document.getElementById('exportCSV');
    const exportJSON = document.getElementById('exportJSON');
    const importJSON = document.getElementById('importJSON');
    const stampaLista = document.getElementById('stampaLista');
    const tableBody = document.getElementById('schedaTable').getElementsByTagName('tbody')[0];
    const jsonViewer = document.getElementById('jsonViewer');
    const jsonContent = document.getElementById('jsonContent');
    const closeJsonViewer = document.getElementById('closeJsonViewer');

    loadSchede();

    schedaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const barreLed = document.getElementById('barreLed').value;
        const quantitaBarreLed = document.getElementById('quantitaBarreLed').value;
        const flatCable = document.getElementById('flatCable').value;
        const quantitaFlatCable = document.getElementById('quantitaFlatCable').value;
        const flatDisplay = document.getElementById('flatDisplay').value;
        const quantitaFlatDisplay = document.getElementById('quantitaFlatDisplay').value;

        if (barreLed && quantitaBarreLed && flatCable && quantitaFlatCable && flatDisplay && quantitaFlatDisplay) {
            const scheda = { barreLed, quantitaBarreLed, flatCable, quantitaFlatCable, flatDisplay, quantitaFlatDisplay, id: Date.now() };
            addRowToTable(scheda);
            saveDataToLocalStorage();
            schedaForm.reset();
        }
    });

    exportCSV.addEventListener('click', () => {
        const rows = tableBody.querySelectorAll('tr');
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Barre LED,Quantità Barre LED,Flat Cable,Quantità Flat Cable,Flat Display,Quantità Flat Display\n";

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const values = Array.from(cells).slice(0, 6).map(td => td.textContent);
            csvContent += values.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'schede_componenti.csv');
        document.body.appendChild(link);
        link.click();
    });

    exportJSON.addEventListener('click', () => {
        const schede = JSON.parse(localStorage.getItem('componentiTV')) || [];
        const jsonContentString = JSON.stringify(schede, null, 2);

        if (/Android/i.test(navigator.userAgent)) {
            jsonContent.value = jsonContentString;
            jsonViewer.classList.remove('hidden');
        } else {
            const blob = new Blob([jsonContentString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'schede_componenti.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    });

    closeJsonViewer.addEventListener('click', () => {
        jsonViewer.classList.add('hidden');
    });

    importJSON.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                const schede = JSON.parse(event.target.result);
                localStorage.setItem('componentiTV', JSON.stringify(schede));
                tableBody.innerHTML = '';
                schede.forEach(scheda => addRowToTable(scheda));
                alert('Dati importati con successo!');
            };

            reader.readAsText(file);
        };

        input.click();
    });

    stampaLista.addEventListener('click', () => {
        window.print();
    });

    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('edit')) {
            editRow(target);
        } else if (target.classList.contains('delete')) {
            deleteRow(target);
        }
    });

    function addRowToTable(scheda) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${scheda.barreLed}</td>
            <td>${scheda.quantitaBarreLed}</td>
            <td>${scheda.flatCable}</td>
            <td>${scheda.quantitaFlatCable}</td>
            <td>${scheda.flatDisplay}</td>
            <td>${scheda.quantitaFlatDisplay}</td>
            <td class="actions">
                <button class="edit" data-id="${scheda.id}">Modifica</button>
                <button class="delete" data-id="${scheda.id}">Elimina</button>
            </td>
        `;
        tableBody.appendChild(newRow);
    }

    function editRow(button) {
        const row = button.closest('tr');
        const cells = row.querySelectorAll('td');
        document.getElementById('barreLed').value = cells[0].textContent;
        document.getElementById('quantitaBarreLed').value = cells[1].textContent;
        document.getElementById('flatCable').value = cells[2].textContent;
        document.getElementById('quantitaFlatCable').value = cells[3].textContent;
        document.getElementById('flatDisplay').value = cells[4].textContent;
        document.getElementById('quantitaFlatDisplay').value = cells[5].textContent;
        row.remove();
        saveDataToLocalStorage();
    }

    function deleteRow(button) {
        if (confirm('Sei sicuro di voler eliminare questa scheda?')) {
            const row = button.closest('tr');
            row.remove();
            saveDataToLocalStorage();
        }
    }

    function saveDataToLocalStorage() {
        const rows = tableBody.querySelectorAll('tr');
        const schede = [];
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            schede.push({
                barreLed: cells[0].textContent,
                quantitaBarreLed: cells[1].textContent,
                flatCable: cells[2].textContent,
                quantitaFlatCable: cells[3].textContent,
                flatDisplay: cells[4].textContent,
                quantitaFlatDisplay: cells[5].textContent,
                id: row.querySelector('.edit').dataset.id
            });
        });
        localStorage.setItem('componentiTV', JSON.stringify(schede));
    }

    function loadSchede() {
        const schede = JSON.parse(localStorage.getItem('componentiTV')) || [];
        schede.forEach(scheda => addRowToTable(scheda));
    }

    // Ricerca dinamica
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(searchTerm) ? '' : 'none';
        });
    });
});
