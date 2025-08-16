// js/items.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig } from './config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const renderItems = (items) => {
  const container = document.getElementById('items-container');
  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = '<p>No items found.</p>';
    return;
  }
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <h3>${item.title || 'Untitled'}</h3>
      <p><strong>Type:</strong> ${item.type}</p>
      <p><strong>Category:</strong> ${item.categoryName}</p>
      <p><strong>Description:</strong> ${item.description}</p>
      <p><strong>Location:</strong> ${item.locationFoundName}</p>
      <p><strong>Date:</strong> ${new Date(item.dateFound?.seconds * 1000).toLocaleDateString()}</p>
      <p><strong>By:</strong> ${item.userName}</p>
    `;
    container.appendChild(card);
  });
};

const fetchItems = async () => {
  try {
    const foundSnap = await getDocs(collection(db, 'foundItem'));
    const lostSnap = await getDocs(collection(db, 'lostItem'));

    const foundItems = foundSnap.docs.map(doc => ({ ...doc.data(), type: 'Found' }));
    const lostItems = lostSnap.docs.map(doc => ({ ...doc.data(), type: 'Lost' }));

    const allItems = [...foundItems, ...lostItems].filter(item => !item.isDeleted);
    renderItems(allItems);
  } catch (err) {
    console.error('Failed to load items:', err);
  }
};

window.addEventListener('DOMContentLoaded', fetchItems);
