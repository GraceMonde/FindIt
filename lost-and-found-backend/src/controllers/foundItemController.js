const { executeQuery } = require('../config/database');

//getting all found items through 
const getAllFoundItems = async (req, res) => {
    try {
        const {category_id, location_id, search } = req.query;
        //const offset = (page - 1) * limit;

        let query = `SELECT * FROM found_items WHERE is_deleted = FALSE`;
        const params = [];

        if (category_id) {
            query += ' AND category_id = ?';
            params.push(category_id);
        }

        if (location_id) {
            query += ' AND location_id = ?';
            params.push(location_id);
        }

        if (search) {
            query += ' AND MATCH(title, description) AGAINST (? IN NATURAL LANGUAGE MODE)';
            params.push(search);
        }

        //query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        //params.push(parseInt(limit), parseInt(offset));

        const items = await executeQuery(query, params);
        res.status(200).json(items);
    } catch (err) {
        console.error('Error fetching the found items:', err);
        res.status(500).json({ message: 'Failed to fetch found items'});
    }
};

//for getting a found item via search by id
const getFoundItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM found_items WHERE found_item_id = ? AND is_deleted = FALSE';
        const result = await executeQuery(query, [id]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Found item not found' });
        }

        res.status(200).json(result[0]);
    } catch (err) {
        console.error('Error fetching found item by ID:', err);
        res.status(500).json({ message: 'Failed to fetch found item' });
    }
};

//for creating a found item
const createFoundItem = async (req, res) => {
    try {
        const { title, description, category_id, location_found_id, location_found_description, date_found, time_found, question_one, answer_one, question_two, answer_two, question_three, answer_three = [] } = req.body;
        const user_id = req.user.user_id;

        const insertQuery = `INSERT INTO found_items (user_id, title, description, category_id, location_found_id, location_found_description, date_found, time_found, question_one, answer_one, question_two, answer_two, question_three, answer_three) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const result = await executeQuery(insertQuery, [
            user_id, title, description, category_id || null,
            location_found_id || null, location_found_description || null,
            date_found || null, time_found || null,
            question_one || null, answer_one || null,   
            question_two || null, answer_two || null,
            question_three || null, answer_three || null
        ]);

        const found_item_id = result.insertId;

        res.status(201).json({ message: 'Found item created successfully', found_item_id});
    } catch (err) {
        console.error('Error creating found item:', err);
        res.status(500).json({ message: 'Failed to create found item'});
    }
};

//for updating a found item
const updateFoundItem = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;

        // Fetch existing values to merge with request body
        const [existingItem] = await executeQuery(
            'SELECT * FROM found_items WHERE found_item_id = ? AND user_id = ? AND is_deleted = FALSE',
            [id, user_id]
        );

        if (!existingItem) {
            return res.status(404).json({ message: 'Found item not found' });
        }

        // Merge request body over existing data
        const {
            title = existingItem.title,
            description = existingItem.description,
            category_id = existingItem.category_id,
            location_found_id = existingItem.location_found_id,
            location_found_description = existingItem.location_found_description,
            date_found = existingItem.date_found,
            time_found = existingItem.time_found,
            question_one = existingItem.question_one,
            answer_one = existingItem.answer_one,
            question_two = existingItem.question_two,
            answer_two = existingItem.answer_two,
            question_three = existingItem.question_three,
            answer_three = existingItem.answer_three
        } = req.body;

        // Run the update query using merged values
        const updateQuery = `
            UPDATE found_items SET 
                title = ?, 
                description = ?, 
                category_id = ?, 
                location_found_id = ?, 
                location_found_description = ?, 
                date_found = ?, 
                time_found = ?, 
                question_one = ?, 
                answer_one = ?, 
                question_two = ?, 
                answer_two = ?, 
                question_three = ?, 
                answer_three = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE found_item_id = ? AND user_id = ? AND is_deleted = FALSE
        `;

        await executeQuery(updateQuery, [
            title, description, category_id,
            location_found_id, location_found_description,
            date_found, time_found,
            question_one, answer_one,
            question_two, answer_two,
            question_three, answer_three,
            id, user_id
        ]);

        res.status(200).json({ message: 'Found item updated successfully' });

    } catch (err) {
        console.error('Error updating found item:', err);
        res.status(500).json({ message: 'Failed to update found item' });
    }
};

//soft deleting a found item
const deleteFoundItem = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;

        const deleteQuery = 'UPDATE found_items SET is_deleted = TRUE WHERE found_item_id = ? AND user_id = ?';
        await executeQuery(deleteQuery, [id, user_id]);

        res.status(200).json({ message: 'Found item deleted successfully' });
    } catch (err) {
        console.error('Error deleting found item:', err);
        res.status(500).json({ message: 'Failed to delete found item' });
    }
};

module.exports = {
    getAllFoundItems,
    getFoundItemById,
    createFoundItem,
    updateFoundItem,
    deleteFoundItem,
};