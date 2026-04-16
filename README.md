# Farm Management System (EbookFarm Clone)

A complete MERN stack application for agricultural management with dynamic form building, production journaling, and traceability.

## Technologies Used
- **Frontend**: React + Vite + TailwindCSS + Ant Design (react-query, zustand)
- **Backend**: Node.js + Express + TypeScript + MongoDB + JWT

## Project Structure
- `backend/`: Node API, models, and controllers
- `frontend/`: React single page application

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally on port 27017 or a valid MongoDB URI in `backend/.env`

## How To Run

### 1. Backend Setup
Open a terminal and run:
```bash
cd backend
npm install

# Seed the database with sample data (Admin account & Demo Dynamic Form)
npm run seed

# Start the dev server
npm run dev
```

The backend server will run on `http://localhost:5000`.

### 2. Frontend Setup
Open another terminal and run:
```bash
cd frontend
npm install

# Start the frontend dev server
npm run dev
```

The frontend will run on the port given by Vite (usually `http://localhost:5173`).

## Login Credentials
- **Admin**: `admin` / `password123`
- **User (Farmer)**: `farmer1` / `password123`

## Features Included
1. **RBAC Authentication**: Admin and User roles
2. **Dashboard**: Statistics overview
3. **Dynamic Form Builder**: Admins can build full journal structures with dynamic fields, tables, etc.
4. **Farm Journals**: Users fill out standard or dynamic forms seamlessly
5. **QR Code Traceability**: Generates a public page for each journal showing the entire timeline transparently
