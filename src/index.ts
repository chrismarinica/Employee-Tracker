import dotenv from 'dotenv';
dotenv.config();
import inquirer, { ListQuestion } from 'inquirer';  // Added ListQuestion type for prompt
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
const queryDatabase = async (text: string, params?: any[]): Promise<any> => {
  try {
    const results = await pool.query(text, params);
    return results;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Inquirer menu
async function main() {
  try {
    const { action }: { action: string } = await inquirer.prompt([
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
        await viewDepartments();
        break;
      case 'View all roles':
        await viewRoles();
        break;
      case 'View all employees':
        await viewEmployees();
        break;
      case 'Add a department':
        await addDepartment();
        break;
      case 'Add a role':
        await addRole();
        break;
      case 'Add an employee':
        await addEmployee();
        break;
      case 'Update an employee role':
        await updateEmployeeRole();
        break;
      case 'Exit':
        console.log('Goodbye!');
        pool.end(); // Close the database connection
        process.exit(0);
    }
    await main(); // Restart the menu
  } catch (error) {
    console.error('Error:', error);
    pool.end(); // Ensure the connection is closed in case of an error
    process.exit(1);
  }
}

// Function definitions
async function viewDepartments() {
  const query = 'SELECT * FROM department';
  const results = await queryDatabase(query);
  console.table(results.rows);
}

async function viewRoles() {
  const query = `
    SELECT role.id, role.title, department.name AS department, role.salary
    FROM role
    INNER JOIN department ON role.department_id = department.id`;
  const results = await queryDatabase(query);
  console.table(results.rows);
}

async function viewEmployees() {
  const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title AS job_title,
           department.name AS department, role.salary, 
           CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id`;
  const results = await queryDatabase(query);
  console.table(results.rows);
}

async function addDepartment() {
  const { departmentName }: { departmentName: string } = await inquirer.prompt([
    { type: 'input', name: 'departmentName', message: 'Enter the department name:' },
  ]);
  const query = 'INSERT INTO department (name) VALUES ($1)';
  await queryDatabase(query, [departmentName]);
  console.log('Department added successfully!');
}

async function addRole() {
  const { roleName, roleSalary, departmentId }: { roleName: string, roleSalary: number, departmentId: number } = await inquirer.prompt([
    { type: 'input', name: 'roleName', message: 'Enter the role name:' },
    { type: 'input', name: 'roleSalary', message: 'Enter the role salary:' },
    { type: 'input', name: 'departmentId', message: 'Enter the department ID for the role:' },
  ]);
  const query = 'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)';
  await queryDatabase(query, [roleName, roleSalary, departmentId]);
  console.log('Role added successfully!');
}

async function addEmployee() {
  const { firstName, lastName, roleId, managerId }: { firstName: string, lastName: string, roleId: number, managerId?: number } = await inquirer.prompt([
    { type: 'input', name: 'firstName', message: 'Enter the employee\'s first name:' },
    { type: 'input', name: 'lastName', message: 'Enter the employee\'s last name:' },
    { type: 'input', name: 'roleId', message: 'Enter the employee\'s role ID:' },
    { type: 'input', name: 'managerId', message: 'Enter the manager ID (or leave blank):' },
  ]);
  const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)';
  await queryDatabase(query, [firstName, lastName, roleId, managerId || null]);
  console.log('Employee added successfully!');
}

async function updateEmployeeRole() {
  const { employeeId, newRoleId }: { employeeId: number, newRoleId: number } = await inquirer.prompt([
    { type: 'input', name: 'employeeId', message: 'Enter the employee ID to update:' },
    { type: 'input', name: 'newRoleId', message: 'Enter the new role ID:' },
  ]);
  const query = 'UPDATE employee SET role_id = $1 WHERE id = $2';
  await queryDatabase(query, [newRoleId, employeeId]);
  console.log('Employee role updated successfully!');
}

// Start the application
main();