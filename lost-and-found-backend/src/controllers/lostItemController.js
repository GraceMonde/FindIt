const { executeQuery } = require('../config/database');

//get all lost items with optional filters
const getAllLostItems = async (req, res) => {
    try {
        const { page = 1, limit = 10, category_id, location_id, search } = req.query;
        const offset = (page - 1) * limit;

        let query = `
        SELECT * FROM lost_items
        WHERE is_deleted = FALSE
        `;

        const params = [];

        if (category_id) {
            query += ' AND category_id = ?';
            params.push(category_id);
        }

        if (location_id) {
            query += ' AND last_seen_location_id = ?';
            params.push(location_id);
        }

        if (search) {
            query += ' AND MATCH(title, description) AGAINST(? IN NATURAL LANGUAGE MODE)';
            params.push(search);
        }

        query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

        const items = await executeQuery(query, params);
        res.status(200).json(items);
    } catch (err) {
        console.error('Error fetching lost items:', err);
        res.status(500).json({ message: 'Failed to fetch lost items' });
    }
};

const createLostItem = async (req, res) => {
    try {
        const { title, description, category_id, last_seen_location_id, last_seen_location_description, date_last_seen, time_last_seen, additional_contact_info } = req.body;
        const user_id = req.user.user_id;
        const user_name = req.user.name;

        const query = `
        INSERT INTO lost_items (
        user_id, user_name, title, description, category_id, last_seen_location_id, last_seen_location_description, date_last_seen, time_last_seen, additional_contact_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            user_id,
            user_name,
            title,
            description,
            category_id || null,
            last_seen_location_id || null,
            last_seen_location_description,
            date_last_seen,
            time_last_seen,
            additional_contact_info
        ];

        await executeQuery(query, params);
        res.status(201).json({ message: 'Lost item reported successfully' });
    } catch (err) {
        console.error('Error creating lost item:', err);
        res.status(500).json({ message: 'Failed to create lost item' });
    }
};

const getLostItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
        SELECT * FROM lost_items WHERE lost_item_id = ? AND is_deleted = FALSE
        `;

        const items = await executeQuery(query, [id]);

        if (!items.length) {
            return res.status(404).json({ message: 'Lost item not found' });
        }

        res.status(200).json(items[0]);
    } catch (err) {
        console.error('Error fetching lost item:', err);
        res.status(500).json({ message: 'Failed to fetch lost item' });
    }
};

const updateLostItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category_id, last_seen_location_id, last_seen_location_description, date_last_seen, time_last_seen, additional_contact_info, status } = req.body;

        const query = `
        UPDATE lost_items
        SET title = ?, description = ?, category_id = ?, last_seen_location_id = ?, last_seen_location_description = ?, date_last_seen = ?, time_last_seen = ?, additional_contact_info = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE lost_item_id = ? AND is_deleted = FALSE
        `;

        if (!req.body) {
          return res.status(400).json({ message: 'No update data provided' });
        }


        const params = [
            title || null,
            description || null,
            category_id || null,
            last_seen_location_id || null,
            last_seen_location_description || null,
            date_last_seen || null,
            time_last_seen || null,
            additional_contact_info || null,
            status || null,
            id
        ];

        await executeQuery(query, params);
        res.status(200).json({ message: 'Lost item updated successfully' });
    } catch (err) {
        console.error('Error updating lost item:', err);
        res.status(500).json({ message: 'Failed to update lost item' });
    }
};

const deleteLostItem = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
        UPDATE lost_items
        SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE lost_item_id = ?
        `;

        await executeQuery(query, [id]);
        res.status(200).json({ message: 'Lost item deleted successfully' });
    } catch (err) {
        console.error('Error deleting lost item:', err);
        res.status(500).json({ message: 'Failed to delete lost item' });
    }
};

module.exports = {
    getAllLostItems,
    createLostItem,
    getLostItemById,
    updateLostItem,
    deleteLostItem,
};