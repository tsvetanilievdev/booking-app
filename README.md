# Booking System

A modern, full-stack booking and appointment management system built with Next.js and Node.js. This application helps service-based businesses manage appointments, clients, and services efficiently.

## 🌟 Features

- **Modern UI/UX**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Multi-language Support**: English and Bulgarian language options
- **Role-based Access**: Separate interfaces for admin and regular users
- **Real-time Analytics**: Dashboard with key business metrics
- **Appointment Management**: Schedule, view, and manage appointments
- **Client Management**: Store and access client information
- **Service Management**: Configure services, pricing, and availability
- **Secure Authentication**: JWT-based authentication system

## 🚀 Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts for analytics
- Sonner for toast notifications

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication

## 🛠️ Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL database

## 📦 Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/booking-system.git
   cd booking-system
   ```

2. Set up environment variables
   ```bash
   # Copy example env files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Install dependencies
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. Set up the database
   ```bash
   cd ../backend
   npx prisma migrate dev
   ```

## 🚀 Running the Application

### Development Mode

1. Start the backend server
   ```bash
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend development server
   ```bash
   cd frontend
   npm run dev
   ```

3. Visit `http://localhost:3000` to view the application

### Production Mode

1. Build the frontend
   ```bash
   cd frontend
   npm run build
   ```

2. Start the production servers
   ```bash
   # Start backend
   cd backend
   npm start

   # Start frontend
   cd frontend
   npm start
   ```

## 🔑 Default Admin Account

For testing purposes, you can use the following admin account:
- Email: admin@example.com
- Password: admin123

## 📚 Documentation

- [API Documentation](backend/rest-api-docs.md)
- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
