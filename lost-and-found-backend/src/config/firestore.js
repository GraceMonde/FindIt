// firestore.js
import { db } from './firebase.js';
import { FieldValue } from 'firebase-admin/firestore';
db.settings({ ignoreUndefinedProperties: true }); // ignoring undefined values

// ============================================================================
// USERS
// ============================================================================

export async function saveUser(userId, userData) {
  try {
    const userRef = db.collection("users").doc(userId);
    await userRef.set({
      ...userData,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: userData.createdAt || FieldValue.serverTimestamp(),
    }, { merge: true });
    return userId;
  } catch (error) {
    console.error("Error saving user:", error);
    throw new Error("Failed to save user");
  }
}

export async function getUser(userId) {
  try {
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    return userSnap.exists ? { id: userSnap.id, ...userSnap.data() } : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
}

export async function getUserByEmail(email) {
  try {
    const snapshot = await db.collection("users")
      .where("email", "==", email)
      .where("isDeleted", "==", false)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Failed to fetch user by email");
  }
}

export async function getAllUsers() {
  try {
    const usersSnap = await db.collection("users").get();
    return usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function deleteUser(userId) {
  try {
    await db.collection("users").doc(userId).update({
      isDeleted: true,
      updatedAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

// ============================================================================
// LOST ITEMS
// ============================================================================

export async function addLostItem(itemData) {
  try {
    const docRef = await db.collection("lostItems").add({
      ...itemData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isDeleted: false
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding lost item:", error);
    throw new Error("Failed to add lost item");
  }
}

export async function getLostItem(itemId) {
  try {
    const itemRef = db.collection("lostItems").doc(itemId);
    const itemSnap = await itemRef.get();
    return itemSnap.exists ? { id: itemSnap.id, ...itemSnap.data() } : null;
  } catch (error) {
    console.error("Error fetching lost item:", error);
    throw new Error("Failed to fetch lost item");
  }
}

export async function getAllLostItems() {
  try {
    const lostItemsSnap = await db.collection("lostItems").get();
    return lostItemsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => !item.isDeleted);
  } catch (error) {
    console.error("Error fetching lost items:", error);
    throw new Error("Failed to fetch lost items");
  }
}

export async function updateLostItem(itemId, updatedData) {
  try {
    await db.collection("lostItems").doc(itemId).update({
      ...updatedData,
      updatedAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating lost item:", error);
    throw new Error("Failed to update lost item");
  }
}

export async function deleteLostItem(itemId) {
  try {
    await db.collection("lostItems").doc(itemId).update({
      isDeleted: true,
      updatedAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Error deleting lost item:", error);
    throw new Error("Failed to delete lost item");
  }
}

// ============================================================================
// FOUND ITEMS
// ============================================================================

export async function addFoundItem(itemData) {
  try {
    const docRef = await db.collection("foundItems").add({
      ...itemData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isDeleted: false
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding found item:", error);
    throw new Error("Failed to add found item");
  }
}

export async function getFoundItem(itemId) {
  try {
    const itemRef = db.collection("foundItems").doc(itemId);
    const itemSnap = await itemRef.get();
    return itemSnap.exists ? { id: itemSnap.id, ...itemSnap.data() } : null;
  } catch (error) {
    console.error("Error fetching found item:", error);
    throw new Error("Failed to fetch found item");
  }
}

export async function getAllFoundItems() {
  try {
    const foundItemsSnap = await db.collection("foundItems").get();
    return foundItemsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => !item.isDeleted);
  } catch (error) {
    console.error("Error fetching found items:", error);
    throw new Error("Failed to fetch found items");
  }
}

export async function updateFoundItem(itemId, updatedData) {
  try {
    await db.collection("foundItems").doc(itemId).update({
      ...updatedData,
      updatedAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating found item:", error);
    throw new Error("Failed to update found item");
  }
}

export async function deleteFoundItem(itemId) {
  try {
    await db.collection("foundItems").doc(itemId).update({
      isDeleted: true,
      updatedAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Error deleting found item:", error);
    throw new Error("Failed to delete found item");
  }
}

// ============================================================================
// CLAIMS
// ============================================================================

export async function createClaim(claimData) {
  try {
    const docRef = await db.collection("claims").add({
      ...claimData,
      status: "Pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isDeleted: false
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating claim:", error);
    throw new Error("Failed to create claim");
  }
}

export async function getClaim(claimId) {
  try {
    const claimRef = db.collection("claims").doc(claimId);
    const claimSnap = await claimRef.get();
    return claimSnap.exists ? { id: claimSnap.id, ...claimSnap.data() } : null;
  } catch (error) {
    console.error("Error fetching claim:", error);
    throw new Error("Failed to fetch claim");
  }
}

export async function getUserClaims(userId) {
  try {
    const claimsSnap = await db.collection("claims")
      .where("claimantId", "==", userId)
      .get();
    return claimsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching user claims:", error);
    throw new Error("Failed to fetch user claims");
  }
}

export async function updateClaim(claimId, updatedData) {
  try {
    await db.collection("claims").doc(claimId).update({
      ...updatedData,
      updatedAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating claim:", error);
    throw new Error("Failed to update claim");
  }
}

export async function deleteClaim(claimId) {
  try {
    await db.collection("claims").doc(claimId).update({
      isDeleted: true,
      updatedAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Error deleting claim:", error);
    throw new Error("Failed to delete claim");
  }
}
