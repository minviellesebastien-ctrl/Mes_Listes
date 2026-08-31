let appData = JSON.parse(localStorage.getItem('appData')) || {
    diverseLists: [],
    items: {
        'Mes Repas': '',
        'Liste de courses': [],
        'A faire': [],
        'Des idées?': []
    }
};

let currentActiveList = '';
let pendingDeleteId = null;
let pendingDeleteName = null;

function renderDiverseLists() {
    const container = document.getElementById('diverse-lists-container');
    container.innerHTML = '';
    
    appData.diverseLists.forEach(list => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-content" onclick="openModal('${list.name}')">
                <span class="list-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
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
        const allFixed = ['Mes Repas', 'Liste de courses', 'A faire', 'Des idées?'];
        if (allFixed.includes(name) || appData.diverseLists.some(l => l.name === name)) {
            alert('Une liste avec ce nom existe déjà.');
            return;
        }
        appData.diverseLists.push({ id: Date.now(), name: name });
        
        // Initialise la nouvelle liste comme une chaîne de texte libre
        if (appData.items[name] === undefined) {
            appData.items[name] = '';
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
    pendingDeleteId = id;
    pendingDeleteName = name;
    document.getElementById('deleteConfirmModal').style.display = 'flex';
    applyBlur();
}

function closeDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    removeBlur();
    pendingDeleteId = null;
    pendingDeleteName = null;
}

function confirmDeleteDiverseList() {
    if (pendingDeleteId !== null && pendingDeleteName !== null) {
        appData.diverseLists = appData.diverseLists.filter(list => list.id !== pendingDeleteId);
        delete appData.items[pendingDeleteName];
        renderDiverseLists();
        closeDeleteConfirmModal();
    }
}

/* Gestion du flou général */
function applyBlur() {
    document.getElementById('pageWrapper')?.classList.add('blurred');
    document.querySelector('.top-yellow-banner')?.classList.add('blurred');
    document.querySelector('.bottom-nav')?.classList.add('blurred');
}

function removeBlur() {
    document.getElementById('pageWrapper')?.classList.remove('blurred');
    document.querySelector('.top-yellow-banner')?.classList.remove('blurred');
    document.querySelector('.bottom-nav')?.classList.remove('blurred');
}

/* Ouverture des pop-ups */
function openModal(title) {
    currentActiveList = title;
    
    // Si la donnée stockée est une chaîne de caractères (texte libre), on ouvre la modale texte libre
    if (typeof appData.items[title] === 'string') {
        openMealModal(title);
        return;
    }
    
    // Sinon, on ouvre la modale standard par éléments
    document.getElementById('modalTitle').innerText = title;
    renderModalItems();
    document.getElementById('customModal').style.display = 'flex';
    applyBlur();
}

function closeModal() {
    document.getElementById('customModal').style.display = 'none';
    removeBlur();
}

/* Pop-up Texte Libre (Mes Repas & Nouvelles Listes) */
function openMealModal(title = 'Mes Repas') {
    currentActiveList = title;
    
    // Met à jour le titre de la modale dynamique
    const titleElement = document.getElementById('mealModalTitle');
    if (titleElement) {
        titleElement.innerText = title;
    }

    const textarea = document.getElementById('mealFreeText');
    textarea.value = typeof appData.items[title] === 'string' ? appData.items[title] : '';
    document.getElementById('mealModal').style.display = 'flex';
    applyBlur();
}

function closeMealModal() {
    document.getElementById('mealModal').style.display = 'none';
    removeBlur();
}

function saveMealText() {
    const textarea = document.getElementById('mealFreeText');
    if (currentActiveList) {
        appData.items[currentActiveList] = textarea.value;
        saveData();
    }
}

function renderModalItems() {
    const container = document.getElementById('itemListContainer');
    container.innerHTML = '';
    
    const items = appData.items[currentActiveList] || [];
    if (Array.isArray(items)) {
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
}

function addItemToList() {
    const input = document.getElementById('newItemInput');
    const text = input.value.trim();
    if (text) {
        if (!appData.items[currentActiveList] || !Array.isArray(appData.items[currentActiveList])) {
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
    if (Array.isArray(appData.items[currentActiveList])) {
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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log('Service Worker enregistré !'))
    .catch((err) => console.log('Erreur Service Worker :', err));
  }
