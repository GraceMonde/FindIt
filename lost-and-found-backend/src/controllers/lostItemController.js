import {
  addLostItem,
  getLostItem,
  getAllLostItems as getAllLostItemsFromFirestore,
  updateLostItem as updateLostItemInFirestore,
  deleteLostItem as deleteLostItemInFirestore
} from '../config/firestore.js';


// Get all lost items

export const getAllLostItems = async (req, res) => {
  try {
    const items = await getAllLostItemsFromFirestore();
    res.status(200).json({ items });
  } catch (err) {
    console.error('Error fetching lost items:', err);
    res.status(500).json({ message: 'Failed to fetch lost items' });
  }
};


// Create a new lost item

export const createLostItem = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category_id, 
      last_seen_location_id, 
      last_seen_location_description, 
      date_last_seen, 
      time_last_seen, 
      additional_contact_info 
    } = req.body;

    const user_id = req.user.user_id; 
    const user_name = req.user.name;

    const itemData = {
      user_id,
      user_name,
      title,
      description,
      category_id: category_id || null,
      last_seen_location_id: last_seen_location_id || null,
      last_seen_location_description,
      date_last_seen,
      time_last_seen,
      additional_contact_info,
      status: "Open",
      isDeleted: false
    };

    const lost_item_id = await addLostItem(itemData);
    res.status(201).json({
      message: 'Lost item reported successfully',
      item: {
        lost_item_id,
        user_id,
        title,
        description,
        category_id: category_id || null,
        last_seen_location_id: last_seen_location_id || null,
        status: "Open"
      }
    });
  } catch (err) {
    console.error('Error creating lost item:', err);
    res.status(500).json({ message: 'Failed to create lost item' });
  }
};

// Get single lost item by ID

export const getLostItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getLostItem(id);

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Lost item not found' });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error('Error fetching lost item:', err);
    res.status(500).json({ message: 'Failed to fetch lost item' });
  }
};

// Update a lost item

export const updateLostItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    await updateLostItemInFirestore(id, updateData);
    res.status(200).json({ message: 'Lost item updated successfully' });
  } catch (err) {
    console.error('Error updating lost item:', err);
    res.status(500).json({ message: 'Failed to update lost item' });
  }
};


// Soft delete a lost item

export const deleteLostItem = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteLostItemInFirestore(id);
    res.status(200).json({ message: 'Lost item deleted successfully' });
  } catch (err) {
    console.error('Error deleting lost item:', err);
    res.status(500).json({ message: 'Failed to delete lost item' });
  }
};
