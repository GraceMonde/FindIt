// items.js
async function loadItems() {
    try {
        const [lostRes, foundRes] = await Promise.all([
            fetch(`${API_BASE_URL}/lost-items`),
            fetch(`${API_BASE_URL}/found-items`)
        ]);

        const lostItems = await lostRes.json();
        const foundItems = await foundRes.json();

        const allItems = [
            ...lostItems.items.map(item => ({ ...item, type: 'lost' })),
            ...foundItems.items.map(item => ({ ...item, type: 'found' })),
        ];

        displayItems(allItems);
    } catch {
        itemsContainer.innerHTML = '<p>Error loading items.</p>';
    }
}

function displayItems(items) {
    const container = document.getElementById('items-container');

    if (!items.length) {
        container.innerHTML = '<p>No items found.</p>';
        return;
    }

    const html = items.map(item => `
        <div class="item-card">
            <span class="item-badge badge-${item.type}">${item.type.toUpperCase()}</span>
            <h3>${item.title}</h3>
            <p><strong>Description:</strong> ${item.description}</p>
            <p><strong>Location:</strong> ${item.location}</p>
            <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</p>
            <p><strong>Contact:</strong> ${item.user_email}</p>
        </div>
    `).join('');

    container.innerHTML = `<div class="items-grid">${html}</div>`;
}

async function searchItems() {
    const query = document.getElementById('search-query').value;
    const type = document.getElementById('filter-type').value;
    const category = document.getElementById('filter-category').value;
    let items = [];

    try {
        if (type === 'lost' || type === '') {
            const res = await fetch(`${API_BASE_URL}/lost-items?search=${query}&category=${category}`);
            const data = await res.json();
            items.push(...data.items.map(item => ({ ...item, type: 'lost' })));
        }

        if (type === 'found' || type === '') {
            const res = await fetch(`${API_BASE_URL}/found-items?search=${query}&category=${category}`);
            const data = await res.json();
            items.push(...data.items.map(item => ({ ...item, type: 'found' })));
        }

        displayItems(items);
    } catch {
        showErrorMessage('Search failed. Try again.');
    }
}
