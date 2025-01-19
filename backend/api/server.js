const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request body
app.use(express.json());  // This is necessary for parsing JSON data from requests

// Middleware to handle CORS and cache headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store'); // Ensure token is not cached
  res.set('Pragma', 'no-cache');
  next();
});
app.use(cors());  // Enable CORS

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Role schema and model
const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const Role = mongoose.model('Role', roleSchema);

// Sequence schema and model to manage user ids
const sequenceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastId: { type: Number, required: true, default: 0 }
});

const Sequence = mongoose.model('Sequence', sequenceSchema);

// User schema and model
const userSchema = new mongoose.Schema({
  _id: { type: Number, required: true },  // Custom user ID as a number
  username: { 
    type: String, 
    required: true, 
    unique: true // Ensures username is unique in the database
  },
  password: { type: String, required: true },
  role: { 
    type: String,  // Store role as a string
    required: true 
  },
});

const User = mongoose.model('User', userSchema);

// Middleware to check if the user has admin rights
const isAdmin = (req, res, next) => {
  const userRole = req.user.role;  // Assume user info is attached to req.user (e.g., from a decoded JWT token)

  if (userRole !== 'admin' && userRole !== 'super_admin') {
    return res.status(403).send('Access denied');
  }

  next(); // Continue to the next middleware/route handler
};

// Middleware to authenticate and attach user info (role) to the request
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send('Access denied, token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user info to the request
    next();
  } catch (err) {
    res.status(401).send('Invalid token');
  }
};

// Create default roles (e.g., user, admin, super_admin)
const createDefaultRoles = async () => {
  const roles = ['user', 'admin', 'super_admin'];

  for (let role of roles) {
    const existingRole = await Role.findOne({ name: role });
    if (!existingRole) {
      const newRole = new Role({ name: role });
      await newRole.save();
    }
  }
};

// Create default roles before starting the server
createDefaultRoles().then(() => {
  console.log('Default roles created');
});

// Helper function to get the next user id
const getNextUserId = async () => {
  const sequence = await Sequence.findOneAndUpdate(
    { name: 'user' },
    { $inc: { lastId: 1 } },
    { new: true, upsert: true }
  );
  return sequence.lastId;
};

// Register route
app.post('/register', async (req, res) => {
  const { username, password, roleName } = req.body;  // Custom role name from the request
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).send('Username is already taken');
    }

    // Validate if the role exists
    const role = await Role.findOne({ name: roleName });

    if (!role) {
      return res.status(400).send('Role does not exist');
    }

    // Get the next user ID from the sequence
    const userId = await getNextUserId();

    // Create and save the user with the custom incremented ID
    const user = new User({
      _id: userId,
      username,
      password: hashedPassword,
      role: roleName  // Save the role name as a string
    });

    await user.save();
    res.status(201).send('User registered');
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send('Username is already taken');
    }
    res.status(400).send('Error registering user');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role }, // Use the role name directly
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

app.get("/roles", async (req, res) => {
  try {
    const roles = await Role.find();  // Fetch all roles from the database
    res.json(roles);  // Send the roles as the response
  } catch (err) {
    res.status(500).send("Error fetching roles");
  }
});
// Logout route
app.post('/logout', (req, res) => {
  // As there is no server-side session with JWT, you just need to inform the client to remove the token
  res.send('Logged out successfully');
});

// Protected route (only accessible by admin or super_admin)
app.get('/admin', authenticate, isAdmin, (req, res) => {
  res.send('Welcome Admin');
});

// Example protected route that only the user can access
app.get('/user-profile', authenticate, (req, res) => {
  res.send('Welcome User');
});

// Catch-all for routes not authenticated (no token provided)
//app.get('*', (req, res) => {
 // res.status(401).send('Authentication required for this route');
//});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


