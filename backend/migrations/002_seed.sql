-- Users
INSERT INTO users (name, email, password, avatar) VALUES
('Alice Smith', 'alice@example.com', '$2a$10$DUMMYHASHEDPW1', 'https://randomuser.me/api/portraits/women/1.jpg'),
('Bob Johnson', 'bob@example.com', '$2a$10$DUMMYHASHEDPW2', 'https://randomuser.me/api/portraits/men/2.jpg');

-- Restaurants
INSERT INTO restaurants (name, description, address, latitude, longitude, cuisine, price, open_hours, phone, website) VALUES
('Sushi Place', 'Fresh sushi and sashimi.', '123 Tokyo St', 35.6895, 139.6917, 'Japanese', '$$$', '10:00-22:00', '123-456-7890', 'https://sushiplace.com'),
('Pizza Corner', 'Authentic Italian pizza.', '456 Rome Ave', 41.9028, 12.4964, 'Italian', '$$', '11:00-23:00', '234-567-8901', 'https://pizzacorner.com'),
('Vegan Delight', 'Plant-based healthy meals.', '789 Green Rd', 34.0522, -118.2437, 'Vegan', '$$', '09:00-21:00', '345-678-9012', 'https://vegandelight.com');

-- Menu Items
INSERT INTO menu_items (restaurant_id, name, description, price, photo) VALUES
(1, 'Salmon Nigiri', 'Fresh salmon over rice.', 4.50, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'),
(1, 'Tuna Roll', 'Classic tuna roll.', 5.00, 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0'),
(2, 'Margherita Pizza', 'Tomato, mozzarella, basil.', 10.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
(2, 'Pepperoni Pizza', 'Spicy pepperoni and cheese.', 12.00, 'https://images.unsplash.com/photo-1548365328-9c6db6c1f1b5'),
(3, 'Quinoa Salad', 'Quinoa, veggies, lemon dressing.', 8.00, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288'),
(3, 'Vegan Burger', 'Plant-based patty, lettuce, tomato.', 9.50, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836');

-- Tables
INSERT INTO tables (restaurant_id, table_number, capacity) VALUES
(1, 'A1', 2), (1, 'A2', 4), (2, 'B1', 2), (2, 'B2', 6), (3, 'C1', 4);

-- Photos
INSERT INTO photos (restaurant_id, url, is_menu) VALUES
(1, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', false),
(2, 'https://images.unsplash.com/photo-1513104890138-7c749659a591', false),
(3, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288', false);

-- Loyalty
INSERT INTO loyalty (user_id, points) VALUES (1, 120), (2, 80);

-- Follows
INSERT INTO follows (user_id, follow_user_id) VALUES (1, 2), (2, 1);

-- Favorites
INSERT INTO favorites (user_id, restaurant_id) VALUES (1, 1), (1, 2), (2, 3);

-- Bookings
INSERT INTO bookings (user_id, restaurant_id, table_id, date, time, guests, status) VALUES
(1, 1, 1, '2025-06-19', '19:00', 2, 'confirmed'),
(2, 2, 3, '2025-06-20', '20:00', 4, 'confirmed');

-- Reviews
INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES
(1, 1, 5, 'Amazing sushi!'),
(2, 2, 4, 'Great pizza, will come again.'),
(1, 3, 5, 'Loved the vegan burger!');

-- Notifications
INSERT INTO notifications (user_id, content) VALUES
(1, 'Your booking at Sushi Place is confirmed!'),
(2, 'You have earned 20 loyalty points.');

-- Activity Log
INSERT INTO activity_log (user_id, action, details) VALUES
(1, 'booking', '{"restaurant_id":1,"date":"2025-06-19"}'),
(2, 'review', '{"restaurant_id":2,"rating":4}');
