-- Switch to the correct database
\c company_db;

-- Clear existing data to prevent duplicates
TRUNCATE employees, roles, departments RESTART IDENTITY CASCADE;

-- Seed data for departments
INSERT INTO departments (name)
VALUES 
    ('Engineering'),
    ('Human Resources'),
    ('Sales'),
    ('Finance');

-- Seed data for roles
INSERT INTO roles (title, salary, department_id)
VALUES 
    ('Software Engineer', 90000, 1),
    ('Senior Software Engineer', 120000, 1),
    ('HR Manager', 75000, 2),
    ('Sales Associate', 55000, 3),
    ('Accountant', 65000, 4);

-- Seed data for employees
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES 
    ('Alice', 'Johnson', 1, NULL),    -- Software Engineer, no manager
    ('Bob', 'Smith', 2, 1),          -- Senior Software Engineer, managed by Alice
    ('Carol', 'Davis', 3, NULL),     -- HR Manager, no manager
    ('David', 'Brown', 4, 3),        -- Sales Associate, managed by Carol
    ('Eve', 'Wilson', 5, NULL);      -- Accountant, no manager