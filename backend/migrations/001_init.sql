-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    cuisine VARCHAR(50),
    price VARCHAR(10),
    open_hours VARCHAR(100),
    phone VARCHAR(30),
    website TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10,2),
    photo TEXT
);

-- Photos
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_menu BOOLEAN DEFAULT FALSE
);

-- Tables (for availability)
CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(10),
    capacity INTEGER
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id INTEGER REFERENCES tables(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Loyalty
CREATE TABLE IF NOT EXISTS loyalty (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0
);

-- Follows (social)
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    follow_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, follow_user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites (bookmarks)
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE(user_id, restaurant_id)
);

-- Activity Log (for feeds/analytics)
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
