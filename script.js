let appData = JSON.parse(localStorage.getItem('appData')) || {
    diverseLists: [],
    items: {
        'Mes Repas': '',
        'Liste Cadeaux': [],
        'Liste Idées': [],
        'Liste Courses': []
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
        const allFixed = ['Mes Repas', 'Liste Cadeaux', 'Liste Idées', 'Liste Courses'];
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
    if (title === 'Mes Repas') {
        openMealModal();
        return;
    }
    
    currentActiveList = title;
    document.getElementById('modalTitle').innerText = title;
    renderModalItems();
    document.getElementById('customModal').style.display = 'flex';
    applyBlur();
}

function closeModal() {
    document.getElementById('customModal').style.display = 'none';
    removeBlur();
}

/* Pop-up spécifique "Mes Repas" */
function openMealModal() {
    const textarea = document.getElementById('mealFreeText');
    textarea.value = typeof appData.items['Mes Repas'] === 'string' ? appData.items['Mes Repas'] : '';
    document.getElementById('mealModal').style.display = 'flex';
    applyBlur();
}

function closeMealModal() {
    document.getElementById('mealModal').style.display = 'none';
    removeBlur();
}

function saveMealText() {
    const textarea = document.getElementById('mealFreeText');
    appData.items['Mes Repas'] = textarea.value;
    saveData();
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
  
