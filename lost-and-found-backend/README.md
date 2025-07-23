This is for a Lost and Found System designed for a school or campus setup. It allows students and staff to report lost and found items, manage their profiles, and browse all reported items. The server is built with Node.js, Express.js, and MySQL, and follows RESTful API standards.

📌 Features Overview
🔐 Authentication Module (/api/auth)
Handles user registration, login, profile retrieval and updating.

Method	Endpoint	Description	Protected
POST	/auth/register	Register a new user	❌
POST	/auth/login	Login and receive a JWT token	❌
POST	/auth/logout	Logout the current user (client-side)	✅
GET	/auth/profile	Get the current user's profile	✅
PUT	/auth/profile	Update profile info	✅

🔧 Security Implementations:

Passwords are hashed using bcryptjs.

JWT tokens are generated and verified using jsonwebtoken.

Protected routes use an authMiddleware to validate tokens.

📂 Lost Items Module (/api/lost-items)
Enables users to post, view, and manage lost item reports.

Method	Endpoint	Description	Protected
GET	/lost-items	List all lost items with pagination & filters	❌
POST	/lost-items	Create a new lost item report	✅
GET	/lost-items/:id	View a specific lost item	❌
PUT	/lost-items/:id	Update a lost item (if owner)	✅
DELETE	/lost-items/:id	Soft-delete a lost item	✅

🔍 Optional Filters:

category_id

location_id

Full-text search on title and description

📦 Found Items Module (/api/found-items)
Similar to the Lost Items module, but for found item reports.

Method	Endpoint	Description	Protected
GET	/found-items	List all found items with filters	❌
POST	/found-items	Create a found item report	✅
GET	/found-items/:id	View a specific found item	❌
PUT	/found-items/:id	Update a found item (if owner)	✅
DELETE	/found-items/:id	Soft-delete a found item	✅

🧠 Middleware Used
express.json() / express.urlencoded() – Parses incoming request bodies.

helmet – Secures HTTP headers.

cors – Enables cross-origin requests.

express-rate-limit – Rate limits API usage to prevent abuse.

authMiddleware – Verifies JWTs for protected routes.

🗂️ Folder Structure (Simplified)
bash
Copy
Edit
lost-and-found-backend/
├── config/
│   └── database.js           # MySQL DB connection
├── controllers/
│   ├── authController.js     # Auth logic
│   ├── lostItemController.js # Lost items logic
│   └── foundItemController.js# Found items logic
├── middleware/
│   └── authMiddleware.js     # JWT auth
├── routes/
│   ├── authRoutes.js         # /api/auth
│   ├── lostItemRoutes.js     # /api/lost-items
│   └── foundItemRoutes.js    # /api/found-items
├── src/
│   └── app.js                # Main express app
├── server.js                 # Entry point
└── .env                      # Environment variables

🛠️ Technologies Used
Node.js – JavaScript runtime

Express.js – Web framework

MySQL2 – Database driver

bcryptjs – Password hashing

jsonwebtoken (JWT) – Authentication

dotenv – Loads environment variables

cors / helmet / rate-limit – Security middleware

🧪 Sample API Test
Here’s an example test for Register User using Postman or Thunder Client:

Register User

bash
Copy
Edit
Method: POST
URL: http://localhost:3000/api/auth/register
Body (JSON):
{
  "email": "testuser@example.com",
  "password": "password123",
  "name": "Test User",
  "student_id": "2025001",
  "phone_number": "0978123456"
}
Expected Outcome:

json
Copy
Edit
{
  "message": "User registered successfully"
}
🔐 .env Configuration Example
env
Copy
Edit
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=lost_and_found
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

------------------------------------------------------------------------------

## ✅ Features Implemented (Frontend)

### 1. **Authentication Module**

* **Login and Registration Forms** with validation.
* Token-based authentication using `localStorage` to store the JWT.
* Auth flow toggles between login and registration.
* Displays success and error messages for user feedback.

### 2. **User Dashboard**

* Personalized greeting with user’s name.
* Buttons for logout and profile update.
* Dynamic display switching between authentication and main app.

### 3. **Item Reporting**

* **Lost Item Reporting**

  * Triggered via a button.
  * Captures title, description, category, location, and date.
* **Found Item Reporting**

  * Similar form structure to lost item reporting.
* Modal-based UI for clean and focused input.

### 4. **Search & Filter**

* Real-time filtering of items by:

  * Type (lost/found)
  * Category
  * Keyword (title or description)
* Implements REST API calls with query params.

### 5. **Items Display**

* Grid layout showing lost and found items.
* Each card displays:

  * Type badge
  * Title
  * Description
  * Location
  * Date (formatted)
  * Category
  * Contact (email from the user)

### 6. **Profile Management**

* Modal to update name, email, and phone number.
* Calls backend `/auth/profile` PUT endpoint to save changes.

### 7. **UI/UX**

* Clean responsive layout with modern design.
* Glassmorphism style with modals and hover effects.
* Mobile-responsive with fallback to single-column layout.
* Loading spinner shown while fetching items.

