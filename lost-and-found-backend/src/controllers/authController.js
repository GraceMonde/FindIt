const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

const registerUser = async (req, res) => {
    const { name, email, password, student_id, phone_number } = req.body;

    try {
        //hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //inserting the user info into the db
        const query = `
        INSERT INTO users (name, email, password_hash, student_id, phone_number) VALUES (?, ?, ?, ?, ?)
        `;

        await executeQuery(query, [name, email, hashedPassword, student_id, phone_number]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Regitration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //check that the user exists in the database
        const query = 'SELECT * FROM users WHERE email = ? AND is_deleted = FALSE';
        const users = await executeQuery('SELECT user_id, email, name, password_hash FROM users WHERE email = ?', [email]);

        if (!users.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        //comparing the password with the hashed one in the db
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        //create a signed jwt token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        //update the last login timestamp
        await executeQuery(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
            [user.user_id]
        );

        //respond with token and basic user data
        res.status(200).json({
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                student_id: user.student_id,
                phone_number: user.phone_number,
                profile_image_url: user.profile_image_url,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};

const logoutUser = async (req, res) => {
    try {
        //this will invalidate the token on the client side, booting them out of the system
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const query = 'SELECT user_id, name, email, student_id, phone_number, profile_image_url, created_at FROM users WHERE user_id = ? AND is_deleted = FALSE';
        const user = await executeQuery(query, [userId]);

        if (!user.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to get user profile'});
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { name, phone_number, profile_image_url } = req.body;

        const updateQuery = `
        UPDATE users
        SET name = ?, phone_number = ?, profile_image_url = ?
        WHERE user_id = ? AND is_deleted = FALSE
        `;

        await executeQuery(updateQuery, [name, phone_number, profile_image_url, userId]);

        res.status(200).json({ message: 'Profile updated successfully' })
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
};