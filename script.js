let appData = JSON.parse(localStorage.getItem('appData')) || {
    diverseLists: [
        { id: 1, name: 'Liste Projet' }
    ],
    items: {
        'Repas': ['Poulet rôti', 'Pâtes carbonara'],
        'Cadeaux': ['Anniversaire Maman', 'Noël'],
        'Idées': ['Peinture salon', 'Voyage Italie'],
        'Courses': ['Lait', 'Oeufs', 'Pain'],
        'A faire': ['Appeler assurance', 'Tondre la pelouse'],
        'Liste Projet': ['Acheter matériel', 'Maquette']
    }
};

let currentActiveList = '';

function renderDiverseLists() {
    const container = document.getElementById('diverse-lists-container');
    container.innerHTML = '';
    
    appData.diverseLists.forEach(list => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-content" onclick="openModal('${list.name}')">
                <span class="list-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                </span>
                <span class="list-title">${list.name}</span>
            </div>
            <button class="delete-btn" onclick="deleteDiverseList(${list.id}, '${list.name}'); event.stopPropagation();" title="Supprimer">×</button>
        `;
        container.appendChild(item);
    });
    saveData();
}

function addDiverseList() {
    const input = document.getElementById('newDiverseInput');
    const name = input.value.trim();
    if (name) {
        const allFixed = ['Repas', 'Cadeaux', 'Idées', 'Courses', 'A faire'];
        if (allFixed.includes(name) || appData.diverseLists.some(l => l.name === name)) {
            alert('Une liste avec ce nom existe déjà.');
            return;
        }
        appData.diverseLists.push({ id: Date.now(), name: name });
        if (!appData.items[name]) {
            appData.items[name] = [];
        }
        input.value = '';
        renderDiverseLists();
    }
}

function handleKeyAdd(e) {
    if (e.key === 'Enter') {
        addDiverseList();
    }
}

function deleteDiverseList(id, name) {
    appData.diverseLists = appData.diverseLists.filter(list => list.id !== id);
    delete appData.items[name];
    renderDiverseLists();
}

function openModal(title) {
    currentActiveList = title;
    document.getElementById('modalTitle').innerText = title;
    renderModalItems();
    document.getElementById('customModal').style.display = 'flex';
    document.getElementById('pageWrapper').classList.add('blurred');
}

function closeModal() {
    document.getElementById('customModal').style.display = 'none';
    document.getElementById('pageWrapper').classList.remove('blurred');
}

function renderModalItems() {
    const container = document.getElementById('itemListContainer');
    container.innerHTML = '';
    
    const items = appData.items[currentActiveList] || [];
    items.forEach((itemText, index) => {
        const li = document.createElement('li');
        li.className = 'item-row';
        li.innerHTML = `
            <span>${itemText}</span>
            <button onclick="removeItem(${index})">×</button>
        `;
        container.appendChild(li);
    });
}

function addItemToList() {
    const input = document.getElementById('newItemInput');
    const text = input.value.trim();
    if (text) {
        if (!appData.items[currentActiveList]) {
            appData.items[currentActiveList] = [];
        }
        appData.items[currentActiveList].push(text);
        input.value = '';
        renderModalItems();
        saveData();
    }
}

function handleItemKeyPress(e) {
    if (e.key === 'Enter') {
        addItemToList();
    }
}

function removeItem(index) {
    if (appData.items[currentActiveList]) {
        appData.items[currentActiveList].splice(index, 1);
        renderModalItems();
        saveData();
    }
}

function saveData() {
    localStorage.setItem('appData', JSON.stringify(appData));
}

function triggerExport() {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
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
            if (data.diverseLists && data.items) {
                appData = data;
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
      
