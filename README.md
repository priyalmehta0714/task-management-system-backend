
# *task-management-system-backend*

This project was generated using node-initdb, a CLI tool for initializing database configurations, web framework setups, and project structures in Node.js projects. *This setup requires you to choose one option from each category: a database, a web framework, a language, and a package manager.*

## Features

- Preconfigured folder structure for streamlined project development.
- *Database Support:* Choose between MongoDB (via Mongoose) or Sequelize (MySQL).
- *Web Framework:* Set up with Express, Fastify, or Elysia.
- *Language Choice:* Develop in JavaScript or TypeScript.
- *Package Manager:* Use npm, yarn, pnpm, or bun.
- Integrated file upload functionality.
- Pre-configured JWT-based authentication.
- Automatically installs required dependencies based on your selected configuration.

## Folder Structure

The following structure was generated:


- config/
- Controllers/
- Routes/
- Models/
- Middleware/
- uploads/
- Utils/


## Getting Started

### Setup Project

Use the 'node-initdb' command to create the project. *You must select one option from each category:*

- *Database:*
  - MongoDB: '-m' or '--mongo'
  - Sequelize: '-s' or '--seque'
- *Web Framework:*
  - Express: '-e' or '--express'
  - Fastify: '-f' or '--fastify'
  - Elysia: '-el' or '--elysia'
- *Language:*
  - JavaScript: '-j' or '--javascript'
  - TypeScript: '-t' or '--typescript'
- *Package Manager:*
  - npm: '-n' or '--npm'
  - yarn: '-ya' or '--yarn'
  - pnpm: '-pn' or '--pnpm'
  - bun: '-b' or '--bun'

Optionally, add '-y' or '--yes' to skip interactive prompts and use default values.

For example, to set up a project with MongoDB, Express, TypeScript, and npm:

bash
node-initdb -m -e -t -n


### Adding a Module

To add a new module to your project, use the 'node-add' command with the same required options:

bash
node-add <moduleName> [-m / --mongo] [-s / --seque] [-e / --express] [-f / --fastify] [-el / --elysia] [-j / --javascript] [-t / --typescript] [-n / --npm] [-ya / --yarn] [-pn / --pnpm] [-b / --bun]


For example, to add a "user" module for MongoDB, Express, TypeScript, and yarn:

bash
node-add user -m -e -t


## About node-initdb

node-initdb is designed to simplify the setup of database-driven projects by generating a preconfigured folder structure and installing required dependencies based on your chosen database, web framework, language, and package manager.

For more information, visit:
- GitHub: [@MohamedAshraf701](https://github.com/MohamedAshraf701)

---

If you encounter any issues, feel free to reach out at ashrafchauhan567@gmail.com or open an issue on GitHub.
            