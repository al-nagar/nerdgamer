# NerdGamer - Gaming Website

A modern gaming website built with Next.js, featuring game pages, user authentication, comments, voting system, and more.

## Features

- 🎮 Game pages with detailed information
- 👥 User authentication and profiles
- 💬 Comment system with replies and voting
- 👍 Game and comment voting system
- 📊 Popular games based on views
- 🔍 Search functionality
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nerdgamer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nerdgamer"
JWT_SECRET="your-super-secret-jwt-key"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project" and import your GitHub repository
4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Your JWT secret key
5. Deploy!

### Option 2: Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and sign up/login
3. Create a new project and select "Deploy from GitHub repo"
4. Add a PostgreSQL database service
5. Set environment variables:
   - `DATABASE_URL`: Railway will provide this automatically
   - `JWT_SECRET`: Your JWT secret key
6. Deploy!

### Option 3: Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign up/login
3. Click "New site from Git" and connect your repository
4. Set build command: `npm run build`
5. Set publish directory: `.next`
6. Add environment variables in Netlify dashboard
7. Deploy!

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing

## Database Setup

The application uses Prisma with PostgreSQL. Make sure to:

1. Run `npx prisma generate` after cloning
2. Run `npx prisma db push` to create tables
3. Set up your `DATABASE_URL` environment variable

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── game/           # Game pages
│   ├── profile/        # User profile pages
│   └── ...
├── components/         # React components
├── context/           # React context providers
├── hooks/             # Custom React hooks
└── lib/               # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
