CREATE USER sp26 WITH PASSWORD 'L,.m';
CREATE DATABASE sp26 OWNER sp26;


-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Rooms table
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    room_name VARCHAR(255) NOT NULL,
    admin_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    room_description VARCHAR(2000),
    is_active BOOLEAN DEFAULT true
);


-- Room members junction table
CREATE TABLE room_members (
    room_id INT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id)
);


-- Messages table with edit tracking
CREATE TABLE msgs (
    msg_id SERIAL PRIMARY KEY,
    room_id INT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    msg_user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    msg_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Indexes for performance
-- Query: "Get all members of room X"
CREATE INDEX idx_room_members_room_id ON room_members(room_id);
-- Query: "Find a user in a specific room"
CREATE INDEX idx_room_members_room_user ON room_members(room_id, user_id);

CREATE INDEX idx_msgs_room_id ON msgs(room_id);

CREATE INDEX idx_msgs_created_at ON msgs(created_at);

CREATE INDEX idx_msgs_msg_user_id ON msgs(msg_user_id);




------------------------------------------------------
-- Register
SELECT user_id FROM users WHERE user_email = $1;;

INSERT INTO users (user_name, user_email, password_hash)
VALUES ($1, $2, $3)
RETURNING user_name, user_email, user_created;

-- Login
SELECT user_id, password_hash FROM users WHERE user_email = $1;



-- Create Room (Creator becomes admin)
INSERT INTO rooms (room_name, admin_id, room_description)
VALUES ($1, $2, $3)
RETURNING room_id, room_name, admin_id, created_at;

-- Add person to room 
INSERT INTO room_members (admin_id, user_id, is_currently_in_room)
VALUES ($1, $2, false)
ON CONFLICT (admin_id, user_id) DO NOTHING
RETURNING admin_id, user_id, joined_at;



-- Join room to chat 
SELECT room_id, room_name, created_at, room_description, admin_id FROM rooms 
WHERE room_id = $1;

SELECT rm.joined_at,
       u.user_name
FROM room_members rm
JOIN users u ON rm.user_id = u.user_id
WHERE rm.room_id = $1 AND u.user_id = $2;

SELECT m.msg_id, m.msg_content, m.created_at, m.edited_at,
       u.user_name, u.user_email
FROM msgs m
JOIN users u ON m.msg_user_id = u.user_id
WHERE m.room_id = $1
ORDER BY m.created_at ASC;

-- Get all messages in a room 
SELECT m.msg_id, m.msg_content, m.created_at, m.edited_at,
        u.user_name, u.user_email
FROM msgs m
JOIN users u ON m.msg_user_id = u.user_id
WHERE m.room_id = $1
ORDER BY m.created_at ASC;

-- Create Message 
INSERT INTO msgs (room_id, msg_content, msg_user_id)
VALUES ($1, $2, $3)
RETURNING msg_id, room_id, msg_content, msg_user_id, created_at, edited_at



-- Get all rooms and users that the user is a member of
SELECT 
    r.room_id,
    r.room_name,
    r.room_description,
    r.admin_id,
    r.created_at,

    a.user_name as admin_name,
    a.user_email as admin_email,

    u.user_id as member_id,
    u.user_name as member_name,
    u.user_email as member_email
FROM rooms r
JOIN room_members rm ON r.room_id = rm.room_id
JOIN users u ON rm.user_id = u.user_id
JOIN users a ON r.admin_id = a.user_id
WHERE rm.user_id = $1
ORDER BY r.room_name, u.user_name




-- Rooms table
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    room_name VARCHAR(255) NOT NULL,
    admin_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    room_description VARCHAR(2000),
    is_active BOOLEAN DEFAULT true
);


-- Room members junction table
CREATE TABLE room_members (
    room_id INT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id)
);

-- Update room
SELECT admin_id 
    FROM rooms
    WHERE room_id = $1

UPDATE rooms
SET room_name = $2,
    admin_id = (SELECT user_id FROM users WHERE user_email = $3),
    room_description = $4
WHERE room_id = $1

DELETE FROM room_members
    WHERE room_id = $1 AND user_id NOT IN (SELECT user_id FROM users WHERE user_email = ANY($2))

INSERT INTO room_members (room_id, user_id)
    SELECT $1, user_id FROM users WHERE user_email = ANY($2)
    ON CONFLICT (room_id, user_id) DO NOTHING

SELECT r.room_id, r.room_name, r.room_description, r.admin_id, u.user_name as admin_name, u.user_email as admin_email
    FROM rooms r
    JOIN users u ON r.admin_id = u.user_id
    WHERE r.room_id = $1

SELECT rm.user_id, u.user_name as member_name, u.user_email
    FROM room_members rm
    JOIN users u ON rm.user_id = u.user_id
    WHERE rm.room_id = $1

-- Remove Room Access
DELETE FROM room_members 
  WHERE room_id = $1 AND user_id = $2





-- Edit message (only sender can edit)
UPDATE msgs 
    SET msg_content = $1, edited_at = CURRENT_TIMESTAMP
    WHERE msg_id = $2 AND msg_user_id = $3 
RETURNING msg_id, msg_content, edited_at;







-- Delete room (only admin can do this)
DELETE FROM rooms
WHERE admin_id = $1 AND admin_id = $2;


-- Soft delete message (only sender or admin can delete)
UPDATE msgs 
SET is_deleted = true, deleted_by = $1, deleted_at = CURRENT_TIMESTAMP
WHERE msg_id = $2 AND is_deleted = false
AND (msg_sender = $1 OR EXISTS (
    SELECT 1 FROM rooms WHERE admin_id = (SELECT admin_id FROM msgs WHERE msg_id = $2) AND admin_id = $1
))
RETURNING msg_id;

-- Check if user can delete message
SELECT 
    CASE 
        WHEN m.msg_sender = $1 THEN true
        WHEN r.admin_id = $1 THEN true
        ELSE false
    END as can_delete
FROM msgs m
JOIN rooms r ON m.admin_id = r.admin_id
WHERE m.msg_id = $2;

-- Check if user can edit message
SELECT msg_sender FROM msgs 
WHERE msg_id = $1 AND is_deleted = false
AND msg_sender = $2;

-- Get all rooms where user is admin
SELECT admin_id, room_name, created_at FROM rooms 
WHERE admin_id = $1
ORDER BY created_at DESC;