let diverseLists = JSON.parse(localStorage.getItem('diverseLists')) || [
    { id: 1, name: 'Liste Projet' }
];

function renderDiverseLists() {
    const container = document.getElementById('diverse-lists-container');
    container.innerHTML = '';
    
    diverseLists.forEach(list => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-content" onclick="openModal('${list.name}')">
                <span class="list-icon">📁</span>
                <span class="list-title">${list.name}</span>
            </div>
            <div style="display:flex; align-items:center;">
                <span class="arrow" onclick="openModal('${list.name}'); event.stopPropagation();">&gt;</span>
                <button class="delete-btn" onclick="deleteDiverseList(${list.id}); event.stopPropagation();" title="Supprimer">×</button>
            </div>
        `;
        container.appendChild(item);
    });
    localStorage.setItem('diverseLists', JSON.stringify(diverseLists));
}

function addDiverseList() {
    const input = document.getElementById('newDiverseInput');
    const name = input.value.trim();
    if (name) {
        diverseLists.push({ id: Date.now(), name: name });
        input.value = '';
        renderDiverseLists();
    }
}

function deleteDiverseList(id) {
    diverseLists = diverseLists.filter(list => list.id !== id);
    renderDiverseLists();
}

function openModal(title) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerText = `Gérez ici les éléments de votre liste : ${title}`;
    document.getElementById('customModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('customModal').style.display = 'none';
}

function triggerExport() {
    const data = {
        diverseLists: diverseLists,
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mes-listes-backup.json';
    a.click();
    URL.revokeObjectURL(url);
}

function triggerImport() {
    document.getElementById('importFile').click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.diverseLists) {
                diverseLists = data.diverseLists;
                renderDiverseLists();
                alert('Importation réussie !');
            } else {
                alert('Format de fichier invalide.');
            }
        } catch (err) {
            alert('Erreur lors de la lecture du fichier.');
        }
    };
    reader.readAsText(file);
}

renderDiverseLists();
