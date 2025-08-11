# PlayConnect Frontend Setup

## Prerequisites
- Node.js (v18 or higher)
- Backend server running on localhost:5000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
# .env file content (already created)
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

## Backend Integration

The frontend is fully integrated with the backend server. Make sure your backend server is running on `http://localhost:5000`.

### API Endpoints Used:
- `POST /api/auth/register` - User registration with image upload
- `POST /api/auth/login` - User login
- `POST /api/password/forgot-password` - Send forgot password OTP
- `POST /api/password/reset-password` - Reset password with OTP

### Features Implemented:
- ✅ Professional authentication system
- ✅ Form validation with real-time feedback
- ✅ Error handling and loading states
- ✅ Profile image upload
- ✅ Password strength validation
- ✅ Forgot password functionality
- ✅ Responsive design
- ✅ Protected routes
- ✅ JWT token management
- ✅ User context/state management

### Project Structure:
```
src/
├── components/          # Reusable components
├── context/            # React Context (AuthContext)
├── hooks/              # Custom hooks (useAuth, etc.)
├── pages/              # Page components
├── services/           # API services
└── App.jsx             # Main app component
```

### Authentication Flow:
1. User registers/logs in
2. JWT token stored in localStorage
3. User data stored in AuthContext
4. Protected routes redirect to dashboard
5. Logout clears token and redirects to home

## Running the Full Application

1. Start the backend server:
```bash
cd ../server
npm start
```

2. Start the frontend (in separate terminal):
```bash
npm run dev
```

The application will be available at `http://localhost:5173`+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
