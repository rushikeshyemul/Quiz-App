# QuizMaster - Interactive Quiz Application

A comprehensive quiz application built with React, TypeScript, and Node.js that allows users to create, take quizzes, and track their progress over time.

## Features

### 🎯 Core Features
- **Interactive Quiz Creation**: Generate quizzes from various topics or upload custom PDFs
- **Real-time Quiz Taking**: Timed quizzes with progress tracking
- **Comprehensive Results**: Detailed feedback with explanations
- **User Authentication**: Secure registration and login system

### 📊 Dashboard & Analytics
- **Test Records Tracking**: Complete history of all quiz attempts
- **Performance Statistics**: Average scores, total attempts, study time
- **Topic Coverage**: Track which subjects you've studied
- **Progress Insights**: Best scores, improvement trends
- **Recent Activity**: View your latest quiz attempts with detailed metrics
- **User Dashboard**: Click on your username in the header to access your personal dashboard with quiz history and statistics

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Tabbed Interface**: Easy navigation between quiz creation and test records
- **Real-time Updates**: Live progress tracking during quizzes
- **Mobile Responsive**: Works seamlessly on all devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz-app
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Setup**
   
   **Backend Setup:**
   ```bash
   cd backend
   node setup-env.js
   ```
   This creates a `.env` file with local MongoDB configuration.
   
   **Frontend Setup:**
   ```bash
   node setup-env.js
   ```
   This creates a `.env` file for the frontend. The app works with mock data by default, but you can optionally:
   - Get a free API key from [Together AI](https://together.ai)
   - Replace `your_together_api_key_here` with your actual API key for AI-powered quiz generation

### Vite Proxy Configuration

The project uses a Vite proxy to forward all `/api` requests from the frontend to the backend server during development.  
**No changes are needed if you use the provided `vite.config.ts`.**  
If you modify backend ports, update the `server.proxy` section in `vite.config.ts` accordingly:

```js
server: {
  proxy: {
    '/api': 'http://localhost:5000', // Change 5000 if your backend uses a different port
  },
},
```

**After changing the Vite config, always restart the frontend dev server.**

5. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start the frontend development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## Usage

### Registration & Login
1. Create a new account with your email and password
2. Log in to access your personalized dashboard

### Taking Quizzes
1. **Choose a Topic**: Select from available topics or enter a custom one
2. **Configure Settings**: Set difficulty, question count, and time limit
3. **Take the Quiz**: Answer questions within the time limit
4. **Review Results**: See detailed feedback and explanations

### Tracking Progress
1. **Dashboard**: View your overall statistics and recent activity
2. **User Dashboard**: Click on your username in the header to access your personal dashboard
3. **Test Records**: Access comprehensive history of all quiz attempts
4. **Performance Insights**: Analyze your improvement over time

### User Dashboard
1. **Access**: Click on your username in the top-right corner of the header
2. **Statistics Overview**: View total attempts, average score, questions answered, and total study time
3. **Recent Performance**: See your last 5 quiz attempts with scores and difficulty levels
4. **Complete History**: Browse all your quiz attempts in a detailed table format
5. **Performance Analysis**: Track pass/fail status, time taken, and topic coverage

### PDF Upload
1. Upload PDF files containing quiz questions
2. The system will extract and format questions automatically
3. Take quizzes based on your uploaded content

## Dashboard Features

### 📈 Statistics Overview
- **Total Attempts**: Number of quizzes completed
- **Average Score**: Overall performance percentage
- **Questions Answered**: Total questions attempted
- **Study Time**: Total time spent on quizzes

### 📚 Topic Coverage
- Visual display of all topics you've studied
- Track your subject diversity and expertise areas

### 📋 Recent Test Records
- Detailed view of recent quiz attempts
- Score percentages with color coding
- Difficulty levels and completion times
- Topic and date information

### 🎯 Performance Insights
- Best score achieved
- Average time per question
- Most attempted topics
- Total study time

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Quiz Management
- `POST /api/quiz` - Save quiz
- `GET /api/quiz` - Get user's quizzes
- `POST /api/quiz/attempt` - Save quiz attempt
- `GET /api/quiz/attempts` - Get user's quiz attempts
- `GET /api/quiz/stats` - Get user statistics

## Database Models

### User
- Basic user information (name, email, password)
- Account creation timestamp

### Quiz
- Quiz content and configuration
- Associated with user
- Topic and difficulty settings

### QuizAttempt
- Complete test record tracking
- Score, time taken, answers
- Difficulty and topic information
- Completion timestamp

## Troubleshooting

### MongoDB Connection Issues
If you encounter MongoDB connection errors:

1. **Install MongoDB locally**:
   ```bash
   # On Windows (using Chocolatey)
   choco install mongodb
   
   # On macOS (using Homebrew)
   brew install mongodb-community
   
   # On Ubuntu/Debian
   sudo apt-get install mongodb
   ```

2. **Start MongoDB service**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Alternative: Use MongoDB Atlas**:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a cluster and get your connection string
   - Update the `MONGO_URI` in your backend `.env` file

4. **Test the connection**:
   ```bash
   cd backend
   npm run test-data
   ```

### Frontend Issues
- Clear browser cache and local storage
- Check browser console for errors
- Ensure both frontend and backend are running

### Testing the Quiz Attempt Fix
1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   npm run dev
   ```

3. **Test the backend API**:
   ```bash
   cd backend
   npm run test-backend
   ```

4. **Take a quiz and check the dashboard**:
   - Log in to the application
   - Take a quiz
   - Click on your username to access the user dashboard
   - Check browser console for debugging information

5. **If issues persist**:
   - Check browser console for error messages
   - Verify MongoDB is running: `mongod`
   - Check backend console for connection errors

#### MongoDB Atlas EREFUSED Error

If you see an error like `MongoDB connection error: Error: querySrv EREFUSED ...`:

- Make sure your internet connection is active.
- Go to your MongoDB Atlas dashboard, and under **Network Access**, add your current IP address or use `0.0.0.0/0` for open access (less secure).
- Double-check your connection string in the backend `.env` file.
- Restart your backend server after making changes.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
