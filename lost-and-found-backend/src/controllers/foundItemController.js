import {
  addFoundItem,
  getFoundItem,
  getAllFoundItems as getAllFoundItemsFromFirestore,
  updateFoundItem as updateFoundItemInFirestore,
  deleteFoundItem as deleteFoundItemInFirestore
} from '../config/firestore.js';

// =========================
// Get all found items (with optional filters)
// =========================
export const getAllFoundItems = async (req, res) => {
  try {
    const { category_id, location_id, search } = req.query;
    const items = await getAllFoundItemsFromFirestore();

    // Apply optional filters on the server side
    const filteredItems = items.filter(item => {
      if (item.isDeleted) return false;
      if (category_id && item.category_id !== category_id) return false;
      if (location_id && item.location_found_id !== location_id) return false;
      if (search) {
        const text = `${item.title} ${item.description}`.toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
      }
      return true;
    });

    res.status(200).json(filteredItems);
  } catch (err) {
    console.error('Error fetching the found items:', err);
    res.status(500).json({ message: 'Failed to fetch found items' });
  }
};

// =========================
// Get single found item by ID
// =========================
export const getFoundItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getFoundItem(id);

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Found item not found' });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error('Error fetching found item by ID:', err);
    res.status(500).json({ message: 'Failed to fetch found item' });
  }
};

// =========================
// Create a new found item
// =========================
export const createFoundItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      location_found_id,
      location_found_description,
      date_found,
      time_found,
      question_one,
      answer_one,
      question_two,
      answer_two,
      question_three,
      answer_three
    } = req.body;

    const user_id = req.user.user_id;
    const user_name = req.user.name;

    const itemData = {
      user_id,
      user_name,
      title,
      description,
      category_id: category_id || null,
      location_found_id: location_found_id || null,
      location_found_description: location_found_description || null,
      date_found: date_found || null,
      time_found: time_found || null,
      question_one: question_one || null,
      answer_one: answer_one || null,
      question_two: question_two || null,
      answer_two: answer_two || null,
      question_three: question_three || null,
      answer_three: answer_three || null,
      isDeleted: false
    };

    const found_item_id = await addFoundItem(itemData);
    res.status(201).json({ message: 'Found item created successfully', found_item_id });
  } catch (err) {
    console.error('Error creating found item:', err);
    res.status(500).json({ message: 'Failed to create found item' });
  }
};

// =========================
// Update a found item
// =========================
export const updateFoundItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    await updateFoundItemInFirestore(id, updateData);
    res.status(200).json({ message: 'Found item updated successfully' });
  } catch (err) {
    console.error('Error updating found item:', err);
    res.status(500).json({ message: 'Failed to update found item' });
  }
};

// =========================
// Soft delete a found item
// =========================
export const deleteFoundItem = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteFoundItemInFirestore(id);
    res.status(200).json({ message: 'Found item deleted successfully' });
  } catch (err) {
    console.error('Error deleting found item:', err);
    res.status(500).json({ message: 'Failed to delete found item' });
  }
};
