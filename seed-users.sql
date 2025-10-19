-- Insert seed users
INSERT INTO users (id, email, first_name, last_name, password_hash, role, created_at, updated_at)
VALUES 
('admin123', 'admin@quantumtrade.ai', 'System', 'Administrator', '$2a$10$xJQHH5Vp1wgO4HvJQ4OB3uUGPd3eO1BTUXcpkgVy2poJiAy3qxBVe', 'admin', NOW(), NOW()),
('user123', 'user@quantumtrade.ai', 'Test', 'User', '$2a$10$jDTbkFgP1PB99KGzxQnGn.vaFkzfZ5BpVp2tozYcX.0nBmdNSNlMq', 'user', NOW(), NOW());
