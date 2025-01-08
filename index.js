var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from 'dotenv';
dotenv.config();
import inquirer from 'inquirer';
import pg from 'pg';
const { Pool } = pg;
// Database connection setup using environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    database: process.env.DB_NAME,
    port: 5432,
});
// Function to query the database
const queryDatabase = (text, params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield pool.query(text, params);
        return results;
    }
    catch (error) {
        console.error('Error executing query:', error.message);
        throw error;
    }
});
// Inquirer menu
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { action } = yield inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: [
                        'View all departments',
                        'View all roles',
                        'View all employees',
                        'Add a department',
                        'Add a role',
                        'Add an employee',
                        'Update an employee role',
                        'Exit',
                    ],
                },
            ]);
            switch (action) {
                case 'View all departments':
                    yield viewDepartments();
                    break;
                case 'View all roles':
                    yield viewRoles();
                    break;
                case 'View all employees':
                    yield viewEmployees();
                    break;
                case 'Add a department':
                    yield addDepartment();
                    break;
                case 'Add a role':
                    yield addRole();
                    break;
                case 'Add an employee':
                    yield addEmployee();
                    break;
                case 'Update an employee role':
                    yield updateEmployeeRole();
                    break;
                case 'Exit':
                    console.log('Goodbye!');
                    pool.end(); // Close the database connection
                    process.exit(0);
            }
            yield main(); // Restart the menu
        }
        catch (error) {
            console.error('Error:', error.message);
            pool.end(); // Ensure the connection is closed in case of an error
            process.exit(1);
        }
    });
}
// Function definitions
function viewDepartments() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'SELECT * FROM department';
        const results = yield queryDatabase(query);
        console.table(results.rows);
    });
}
function viewRoles() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `
    SELECT role.id, role.title, department.name AS department, role.salary
    FROM role
    INNER JOIN department ON role.department_id = department.id`;
        const results = yield queryDatabase(query);
        console.table(results.rows);
    });
}
function viewEmployees() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title AS job_title,
           department.name AS department, role.salary, 
           CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id`;
        const results = yield queryDatabase(query);
        console.table(results.rows);
    });
}
function addDepartment() {
    return __awaiter(this, void 0, void 0, function* () {
        const { departmentName } = yield inquirer.prompt([
            { type: 'input', name: 'departmentName', message: 'Enter the department name:' },
        ]);
        const query = 'INSERT INTO department (name) VALUES ($1)';
        yield queryDatabase(query, [departmentName]);
        console.log('Department added successfully!');
    });
}
function addRole() {
    return __awaiter(this, void 0, void 0, function* () {
        const { roleName, roleSalary, departmentId } = yield inquirer.prompt([
            { type: 'input', name: 'roleName', message: 'Enter the role name:' },
            { type: 'input', name: 'roleSalary', message: 'Enter the role salary:' },
            { type: 'input', name: 'departmentId', message: 'Enter the department ID for the role:' },
        ]);
        const query = 'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)';
        yield queryDatabase(query, [roleName, roleSalary, departmentId]);
        console.log('Role added successfully!');
    });
}
function addEmployee() {
    return __awaiter(this, void 0, void 0, function* () {
        const { firstName, lastName, roleId, managerId } = yield inquirer.prompt([
            { type: 'input', name: 'firstName', message: 'Enter the employee\'s first name:' },
            { type: 'input', name: 'lastName', message: 'Enter the employee\'s last name:' },
            { type: 'input', name: 'roleId', message: 'Enter the employee\'s role ID:' },
            { type: 'input', name: 'managerId', message: 'Enter the manager ID (or leave blank):' },
        ]);
        const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)';
        yield queryDatabase(query, [firstName, lastName, roleId, managerId || null]);
        console.log('Employee added successfully!');
    });
}
function updateEmployeeRole() {
    return __awaiter(this, void 0, void 0, function* () {
        const { employeeId, newRoleId } = yield inquirer.prompt([
            { type: 'input', name: 'employeeId', message: 'Enter the employee ID to update:' },
            { type: 'input', name: 'newRoleId', message: 'Enter the new role ID:' },
        ]);
        const query = 'UPDATE employee SET role_id = $1 WHERE id = $2';
        yield queryDatabase(query, [newRoleId, employeeId]);
        console.log('Employee role updated successfully!');
    });
}
// Start the application
main();