Bookstore API Lab

An interactive full-stack learning application for exploring REST API operations, managing book inventory, testing external MockAPI endpoints, and generating Python API request scripts.

Project Overview

Bookstore API Lab provides a practical environment for learning how applications communicate with APIs.

Users can practise the four core REST operations — GET, POST, PUT and DELETE — using a built-in bookstore inventory or their own MockAPI endpoint.

The application also includes a Python script generator to help learners understand how to perform API requests using Python.

Features

- Book inventory: View and manage sample bookstore records.
- GET requests: Retrieve all books or a specific book.
- POST requests: Add new books to the inventory.
- PUT requests: Replace an existing book record.
- DELETE requests: Remove a book and verify the deletion.
- MockAPI integration: Send requests to an external MockAPI endpoint.
- REST request logs: Inspect request methods, response statuses and execution times.
- Python script generator: Generate a Python script for practising API requests.
- Learning checklist: Track completed practical activities.

Technology Stack

Technology| Purpose
React| User interface
TypeScript| Application logic and type safety
Vite| Development server and frontend tooling
Node.js| JavaScript runtime
Express.js| Backend API
Python| Generated API request scripts
MockAPI| External REST API practice
Tailwind CSS| Interface styling

Project Structure

Bookstore-api/
├── src/
│   ├── components/
│   ├── data/
│   ├── types/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts

REST API Endpoints

The built-in Express server provides the following endpoints:

Method| Endpoint| Description
GET| "/api/books"| Retrieve all books
GET| "/api/books/:id"| Retrieve one book
POST| "/api/books"| Add a book
PUT| "/api/books/:id"| Replace a book
DELETE| "/api/books/:id"| Delete a book
POST| "/api/books/reset"| Restore sample inventory
POST| "/api/proxy"| Forward supported requests to MockAPI

Example Book Record

{
  "id": "1",
  "title": "Atomic Habits",
  "author": "James Clear",
  "rating": "9"
}

Getting Started

Requirements

- Node.js
- npm
- Git

1. Clone the repository

git clone https://github.com/april07-pi/Bookstore-api.git

2. Enter the project directory

cd Bookstore-api

3. Install dependencies

npm install

4. Start the development server

npm run dev

Open the local address displayed in your terminal.

Learning Outcomes

This project demonstrates practical understanding of:

- REST API architecture.
- HTTP methods and status codes.
- Frontend-to-backend communication.
- Express.js route development.
- JSON request and response handling.
- API validation and error handling.
- External API integration.
- Python API request generation.
- TypeScript and React development.

Current Limitations

- The built-in inventory uses in-memory storage. Changes reset when the server restarts.
- External MockAPI functionality requires a configured MockAPI endpoint.
- The application is primarily a learning and demonstration environment, not a production bookstore platform.
- The generated Python script is intended for learning and should be tested in a suitable Python environment.

Future Improvements

- Add persistent database storage.
- Implement automated API tests.
- Add authentication and user roles.
- Improve input validation and error handling.
- Add deployment configuration and documentation.

Project Purpose

This project demonstrates my practical development journey in full-stack technology, with a focus on backend development, REST APIs, frontend integration and Python.

---

Developer: Nokwazi Nobuhle Xaba

GitHub: "april07-pi" (https://github.com/april07-pi)
