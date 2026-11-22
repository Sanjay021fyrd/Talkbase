-- ============================================================================
-- TalkBase sample PostgreSQL databases
--
-- Creates 5 small databases (school, library, hospital, restaurant, company).
-- Each has 2 related tables and every table holds between 11 and 19 rows.
--
-- HOW TO RUN (once):
--   1. Start menu -> "SQL Shell (psql)", log in as user postgres.
--   2. Type:   \i '<project>/backend/utils/postgres_sample_databases.sql'
--
-- This script uses psql commands (\c), so it must be run in SQL Shell (psql),
-- not in the pgAdmin Query Tool. Run it only once: if a database already
-- exists, the script stops with an error instead of overwriting anything.
-- ============================================================================

\set ON_ERROR_STOP on

-- ============================================================================
-- 1) school  : students (15 rows), marks (18 rows)
-- ============================================================================
CREATE DATABASE school;
\c school

CREATE TABLE students (
  student_id SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  class      TEXT NOT NULL,
  city       TEXT
);

INSERT INTO students (name, class, city) VALUES
  ('Aarav Sharma',   '10A', 'Bengaluru'),
  ('Priya Nair',     '10A', 'Kochi'),
  ('Rohan Mehta',    '10B', 'Mumbai'),
  ('Sneha Iyer',     '9A',  'Chennai'),
  ('Vikram Singh',   '9B',  'Delhi'),
  ('Meera Reddy',    '10A', 'Hyderabad'),
  ('Arjun Verma',    '9A',  'Pune'),
  ('Kavya Menon',    '10B', 'Kochi'),
  ('Rahul Gupta',    '9B',  'Delhi'),
  ('Ananya Das',     '9A',  'Kolkata'),
  ('Karthik Rao',    '10B', 'Bengaluru'),
  ('Neha Kulkarni',  '9B',  'Pune'),
  ('Sourav Ghosh',   '10A', 'Kolkata'),
  ('Lakshmi Pillai', '9A',  'Chennai'),
  ('Amit Kumar',     '10B', 'Mumbai');

CREATE TABLE marks (
  mark_id    SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students (student_id),
  subject    TEXT NOT NULL,
  score      INT  NOT NULL,
  exam_date  DATE NOT NULL
);

INSERT INTO marks (student_id, subject, score, exam_date) VALUES
  (1,  'Maths',   88, '2025-03-10'),
  (1,  'Science', 92, '2025-03-12'),
  (2,  'Maths',   76, '2025-03-10'),
  (2,  'English', 81, '2025-03-14'),
  (3,  'Maths',   64, '2025-03-10'),
  (3,  'Science', 58, '2025-03-12'),
  (4,  'English', 95, '2025-03-14'),
  (4,  'Maths',   90, '2025-03-10'),
  (5,  'Science', 71, '2025-03-12'),
  (6,  'Maths',   84, '2025-03-10'),
  (7,  'English', 67, '2025-03-14'),
  (8,  'Science', 89, '2025-03-12'),
  (9,  'Maths',   55, '2025-03-10'),
  (10, 'English', 78, '2025-03-14'),
  (11, 'Maths',   93, '2025-03-10'),
  (12, 'Science', 62, '2025-03-12'),
  (13, 'English', 85, '2025-03-14'),
  (14, 'Maths',   73, '2025-03-10');

-- ============================================================================
-- 2) library : books (14 rows), borrowings (16 rows)
-- ============================================================================
\c postgres
CREATE DATABASE library;
\c library

CREATE TABLE books (
  book_id SERIAL PRIMARY KEY,
  title   TEXT NOT NULL,
  author  TEXT NOT NULL,
  genre   TEXT NOT NULL,
  price   NUMERIC(8,2) NOT NULL,
  copies  INT NOT NULL
);

INSERT INTO books (title, author, genre, price, copies) VALUES
  ('The Alchemist',                          'Paulo Coelho',        'Fiction',   299.00, 5),
  ('Wings of Fire',                          'A. P. J. Abdul Kalam', 'Biography', 350.00, 4),
  ('Godan',                                  'Premchand',           'Classic',   220.00, 3),
  ('The God of Small Things',                'Arundhati Roy',       'Fiction',   399.00, 2),
  ('Malgudi Days',                           'R. K. Narayan',       'Classic',   250.00, 6),
  ('The White Tiger',                        'Aravind Adiga',       'Fiction',   325.00, 3),
  ('Gitanjali',                              'Rabindranath Tagore', 'Poetry',    180.00, 4),
  ('Train to Pakistan',                      'Khushwant Singh',     'History',   275.00, 2),
  ('Sapiens',                                'Yuval Noah Harari',   'History',   499.00, 5),
  ('Atomic Habits',                          'James Clear',         'Self-help', 450.00, 7),
  ('Harry Potter and the Philosopher''s Stone', 'J. K. Rowling',    'Fantasy',   399.00, 6),
  ('The Hobbit',                             'J. R. R. Tolkien',    'Fantasy',   350.00, 3),
  ('1984',                                   'George Orwell',       'Classic',   199.00, 4),
  ('Rich Dad Poor Dad',                      'Robert Kiyosaki',     'Self-help', 299.00, 5);

CREATE TABLE borrowings (
  borrow_id   SERIAL PRIMARY KEY,
  book_id     INT NOT NULL REFERENCES books (book_id),
  member_name TEXT NOT NULL,
  borrow_date DATE NOT NULL,
  return_date DATE            -- NULL means not returned yet
);

INSERT INTO borrowings (book_id, member_name, borrow_date, return_date) VALUES
  (1,  'Asha Rao',     '2025-01-05', '2025-01-19'),
  (3,  'Manoj Nair',   '2025-01-08', '2025-01-22'),
  (5,  'Divya Menon',  '2025-01-12', '2025-01-25'),
  (2,  'Asha Rao',     '2025-01-20', '2025-02-03'),
  (9,  'Kiran Shah',   '2025-01-28', NULL),
  (10, 'Pooja Bansal', '2025-02-01', '2025-02-15'),
  (7,  'Manoj Nair',   '2025-02-04', '2025-02-18'),
  (11, 'Divya Menon',  '2025-02-10', NULL),
  (14, 'Kiran Shah',   '2025-02-12', '2025-02-26'),
  (4,  'Rahul Jain',   '2025-02-18', '2025-03-04'),
  (1,  'Pooja Bansal', '2025-02-25', '2025-03-11'),
  (12, 'Rahul Jain',   '2025-03-02', NULL),
  (9,  'Asha Rao',     '2025-03-05', '2025-03-19'),
  (13, 'Manoj Nair',   '2025-03-10', NULL),
  (6,  'Divya Menon',  '2025-03-15', '2025-03-29'),
  (8,  'Kiran Shah',   '2025-03-20', NULL);

-- ============================================================================
-- 3) hospital : patients (15 rows), appointments (18 rows)
-- ============================================================================
\c postgres
CREATE DATABASE hospital;
\c hospital

CREATE TABLE patients (
  patient_id SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  age        INT  NOT NULL,
  gender     TEXT NOT NULL,
  city       TEXT
);

INSERT INTO patients (name, age, gender, city) VALUES
  ('Ramesh Kumar',   54, 'M', 'Chennai'),
  ('Sunita Devi',    47, 'F', 'Delhi'),
  ('Arjun Reddy',    29, 'M', 'Hyderabad'),
  ('Fatima Khan',    36, 'F', 'Mumbai'),
  ('Gopal Das',      62, 'M', 'Kolkata'),
  ('Lakshmi Iyer',   41, 'F', 'Bengaluru'),
  ('Imran Sheikh',   33, 'M', 'Pune'),
  ('Divya Nair',      8, 'F', 'Kochi'),
  ('Harish Patel',   58, 'M', 'Ahmedabad'),
  ('Meena Kumari',   25, 'F', 'Delhi'),
  ('Suresh Babu',    71, 'M', 'Chennai'),
  ('Anita Joshi',    39, 'F', 'Pune'),
  ('Rohit Sharma',   12, 'M', 'Mumbai'),
  ('Kavita Menon',   50, 'F', 'Kochi'),
  ('Vijay Singh',    45, 'M', 'Delhi');

CREATE TABLE appointments (
  appointment_id   SERIAL PRIMARY KEY,
  patient_id       INT NOT NULL REFERENCES patients (patient_id),
  doctor           TEXT NOT NULL,
  department       TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  fee              NUMERIC(8,2) NOT NULL,
  status           TEXT NOT NULL   -- Completed, Scheduled or Cancelled
);

INSERT INTO appointments (patient_id, doctor, department, appointment_date, fee, status) VALUES
  (1,  'Dr. Mehta',     'Cardiology',       '2025-04-02', 800.00, 'Completed'),
  (2,  'Dr. Banerjee',  'General Medicine', '2025-04-03', 400.00, 'Completed'),
  (3,  'Dr. Rao',       'Orthopedics',      '2025-04-04', 700.00, 'Completed'),
  (4,  'Dr. Iyer',      'Dermatology',      '2025-04-07', 600.00, 'Cancelled'),
  (5,  'Dr. Mehta',     'Cardiology',       '2025-04-08', 800.00, 'Completed'),
  (6,  'Dr. Banerjee',  'General Medicine', '2025-04-09', 400.00, 'Completed'),
  (7,  'Dr. Rao',       'Orthopedics',      '2025-04-10', 700.00, 'Scheduled'),
  (8,  'Dr. Nair',      'Pediatrics',       '2025-04-11', 500.00, 'Completed'),
  (9,  'Dr. Mehta',     'Cardiology',       '2025-04-14', 800.00, 'Scheduled'),
  (10, 'Dr. Iyer',      'Dermatology',      '2025-04-15', 600.00, 'Completed'),
  (11, 'Dr. Banerjee',  'General Medicine', '2025-04-16', 400.00, 'Cancelled'),
  (12, 'Dr. Iyer',      'Dermatology',      '2025-04-17', 600.00, 'Scheduled'),
  (13, 'Dr. Nair',      'Pediatrics',       '2025-04-18', 500.00, 'Completed'),
  (14, 'Dr. Rao',       'Orthopedics',      '2025-04-21', 700.00, 'Completed'),
  (15, 'Dr. Mehta',     'Cardiology',       '2025-04-22', 800.00, 'Scheduled'),
  (1,  'Dr. Banerjee',  'General Medicine', '2025-04-23', 400.00, 'Completed'),
  (5,  'Dr. Rao',       'Orthopedics',      '2025-04-24', 700.00, 'Scheduled'),
  (3,  'Dr. Iyer',      'Dermatology',      '2025-04-25', 600.00, 'Completed');

-- ============================================================================
-- 4) restaurant : menu_items (14 rows), orders (17 rows)
-- ============================================================================
\c postgres
CREATE DATABASE restaurant;
\c restaurant

CREATE TABLE menu_items (
  item_id  SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  category TEXT NOT NULL,
  price    NUMERIC(6,2) NOT NULL,
  is_veg   BOOLEAN NOT NULL
);

INSERT INTO menu_items (name, category, price, is_veg) VALUES
  ('Paneer Tikka',     'Starter',     220.00, TRUE),
  ('Chicken 65',       'Starter',     260.00, FALSE),
  ('Veg Spring Rolls', 'Starter',     180.00, TRUE),
  ('Butter Chicken',   'Main Course', 340.00, FALSE),
  ('Dal Makhani',      'Main Course', 240.00, TRUE),
  ('Veg Biryani',      'Main Course', 260.00, TRUE),
  ('Chicken Biryani',  'Main Course', 320.00, FALSE),
  ('Masala Dosa',      'Main Course', 140.00, TRUE),
  ('Garlic Naan',      'Main Course',  60.00, TRUE),
  ('Gulab Jamun',      'Dessert',      90.00, TRUE),
  ('Ice Cream',        'Dessert',     110.00, TRUE),
  ('Masala Chai',      'Beverage',     40.00, TRUE),
  ('Fresh Lime Soda',  'Beverage',     70.00, TRUE),
  ('Cold Coffee',      'Beverage',    120.00, TRUE);

CREATE TABLE orders (
  order_id   SERIAL PRIMARY KEY,
  item_id    INT NOT NULL REFERENCES menu_items (item_id),
  quantity   INT NOT NULL,
  table_no   INT NOT NULL,
  order_date DATE NOT NULL
);

INSERT INTO orders (item_id, quantity, table_no, order_date) VALUES
  (1,  2, 4,  '2025-05-01'),
  (4,  1, 4,  '2025-05-01'),
  (9,  4, 4,  '2025-05-01'),
  (6,  2, 7,  '2025-05-01'),
  (12, 3, 7,  '2025-05-02'),
  (7,  1, 2,  '2025-05-02'),
  (10, 2, 2,  '2025-05-02'),
  (2,  2, 9,  '2025-05-03'),
  (5,  1, 9,  '2025-05-03'),
  (13, 2, 9,  '2025-05-03'),
  (8,  3, 5,  '2025-05-04'),
  (14, 2, 5,  '2025-05-04'),
  (4,  2, 1,  '2025-05-04'),
  (11, 2, 1,  '2025-05-05'),
  (3,  1, 6,  '2025-05-05'),
  (7,  2, 6,  '2025-05-05'),
  (12, 4, 3,  '2025-05-06');

-- ============================================================================
-- 5) company : employees (15 rows), leave_requests (12 rows)
-- ============================================================================
\c postgres
CREATE DATABASE company;
\c company

CREATE TABLE employees (
  emp_id     SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  department TEXT NOT NULL,
  salary     NUMERIC(10,2) NOT NULL,
  join_date  DATE NOT NULL,
  city       TEXT
);

INSERT INTO employees (name, department, salary, join_date, city) VALUES
  ('Aarav Sharma',   'Engineering', 95000.00, '2021-03-15', 'Bengaluru'),
  ('Priya Nair',     'Engineering', 120000.00, '2019-07-01', 'Bengaluru'),
  ('Rohan Mehta',    'Sales',       60000.00, '2022-01-10', 'Mumbai'),
  ('Sneha Iyer',     'HR',          55000.00, '2020-11-23', 'Chennai'),
  ('Vikram Singh',   'Sales',       72000.00, '2018-05-05', 'Delhi'),
  ('Meera Reddy',    'Engineering', 110000.00, '2020-02-17', 'Hyderabad'),
  ('Arjun Verma',    'Finance',     88000.00, '2019-09-09', 'Mumbai'),
  ('Kavya Menon',    'Marketing',   65000.00, '2023-04-03', 'Bengaluru'),
  ('Rahul Gupta',    'Sales',       58000.00, '2023-08-21', 'Delhi'),
  ('Ananya Das',     'Finance',     92000.00, '2017-12-12', 'Kolkata'),
  ('Karthik Rao',    'Engineering', 105000.00, '2021-10-04', 'Hyderabad'),
  ('Neha Kulkarni',  'HR',          52000.00, '2022-06-27', 'Pune'),
  ('Sourav Ghosh',   'Marketing',   70000.00, '2021-01-18', 'Kolkata'),
  ('Lakshmi Pillai', 'Finance',     85000.00, '2020-08-30', 'Chennai'),
  ('Amit Kumar',     'Engineering', 98000.00, '2022-11-14', 'Pune');

CREATE TABLE leave_requests (
  request_id SERIAL PRIMARY KEY,
  emp_id     INT NOT NULL REFERENCES employees (emp_id),
  leave_type TEXT NOT NULL,   -- Sick, Casual or Annual
  days       INT  NOT NULL,
  status     TEXT NOT NULL    -- Approved, Pending or Rejected
);

INSERT INTO leave_requests (emp_id, leave_type, days, status) VALUES
  (1,  'Annual', 5, 'Approved'),
  (3,  'Sick',   2, 'Approved'),
  (4,  'Casual', 1, 'Approved'),
  (6,  'Annual', 7, 'Pending'),
  (8,  'Sick',   3, 'Approved'),
  (9,  'Casual', 2, 'Rejected'),
  (10, 'Annual', 10, 'Approved'),
  (11, 'Sick',   1, 'Approved'),
  (13, 'Casual', 1, 'Pending'),
  (2,  'Annual', 4, 'Pending'),
  (5,  'Sick',   2, 'Approved'),
  (14, 'Casual', 2, 'Approved');

\c postgres
\echo 'Done: databases school, library, hospital, restaurant and company are ready.'
