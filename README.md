# WellSync - AI-powered Wellness Advisor Platform

**WellSync** is a full-stack web platform that connects users with wellness advisors. It provide a chatbot which is intelligent, conversational assistance for mental and physical wellness support.

## Features
- Appointment booking and management
- Clean frontend with HTML, CSS, and JavaScript
- RESTful API built with Node.js and Express
- MongoDB for storing user and appointment data
- User and advisor login system

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

- **Environment Variables**: dotenv
- **HTTP Client**: Axios

## Project Structure

```
advisor/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
├── frontend/
│   ├── assets/
│   └── index.html
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Sidakpreet-singh/advisor.git
cd advisor
```

### 2. Install backend dependencies

```bash
cd backend
npm install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the `backend` folder with the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start the backend server

```bash
npm server.js
```

### 5. Launch the frontend

Open `frontend/index.html` directly in your browser or use a Live Server extension.

