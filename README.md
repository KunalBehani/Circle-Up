# CircleUp — Find Your People. Join the Conversation.

**A Reddit-inspired community platform built for discovering communities, sharing ideas, and connecting with people who share your interests.**

CircleUp is a full-stack web application where users can explore interest-based communities, publish posts, participate in discussions, and share visual content. It combines a responsive React interface with a Node.js and Express API, MongoDB persistence, JWT-based authentication, and Cloudinary-powered media uploads.

<p align="center">
  <a href="https://github.com/KunalBehani/Circle-Up">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repository" />
  </a>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Future Improvements](#future-improvements)
- [Author](#author)
- [License](#license)

## Overview

Online communities bring people together around shared interests. CircleUp aims to make those interactions simple by providing a central place to discover communities, publish content, and participate in conversations.

The project was developed as a full-stack application, with an emphasis on component-based frontend development, modular backend architecture, authentication, database integration, API design, and deployment.

### Why CircleUp?

- **Community-driven:** Organize discussions around shared interests.
- **Interactive:** Support posts, comments, and voting.
- **Media-friendly:** Upload images and videos alongside written content.
- **Full-stack:** Connect a React frontend to a persistent database-backed API.
- **Deployment-ready:** Separate frontend and backend deployments.

## Features

### Communities and Discovery
- Browse interest-based communities.
- Explore community-specific discussions.
- Search for relevant content and communities.

### Posts and Discussions
- Create and view posts.
- Organize posts by community and content type.
- Open individual post detail pages.
- Participate in discussions through comments.
- Vote on posts.

### Image and Video Uploads
- Upload images and videos with posts.
- Store media assets in Cloudinary.
- Save media metadata with posts in MongoDB.
- Display uploaded media in feed cards and individual post pages.
- Validate supported media types and upload sizes on the server.

### Authentication
- User registration and login.
- JWT-based authentication.
- Protected API operations.
- Bearer-token authentication from the frontend.

### Responsive User Experience
- React-based, component-driven interface.
- Client-side navigation with React Router.
- Reusable UI components.
- API integration using Axios.

> Feature availability may depend on the current implementation. Check the deployed application for the latest behavior.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Build tool | Vite |
| Language | JavaScript (ES modules) |
| Routing | React Router |
| API client | Axios |
| Backend | Node.js and Express |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Media storage | Cloudinary |
| API security | Helmet, CORS, rate limiting |
| Logging | Morgan |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Version control | Git and GitHub |
| Testing | Vitest |

## Architecture

CircleUp uses a separate frontend and backend architecture.

```text
                  ┌──────────────────────┐
                  │       User            │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  React + Vite Client │
                  │      (Vercel)         │
                  └──────────┬───────────┘
                             │ HTTPS / REST API
                             ▼
                  ┌──────────────────────┐
                  │  Express API Server  │
                  │      (Render)        │
                  └──────┬─────────┬─────┘
                         │         │
                ┌────────▼───┐  ┌──▼──────────┐
                │  MongoDB   │  │  Cloudinary │
                │   Atlas    │  │ Media Assets│
                └────────────┘  └─────────────┘
```

### Request Flow

1. The user interacts with the React frontend.
2. Axios sends HTTP requests to the Express API.
3. Authentication middleware verifies JWTs for protected operations.
4. Mongoose reads or writes application data in MongoDB.
5. For media posts, the backend uploads files to Cloudinary and stores the resulting media references in MongoDB.
6. The API returns the result to the frontend for rendering.

## Project Structure

```text
Circle-Up/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── posts/
│   │   │       ├── PostCard.jsx
│   │   │       └── PostMedia.jsx
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── test/
│   │   └── ...
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   └── mediaUpload.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/
│   └── package.json
├── package.json
├── package-lock.json
└── README.md
```

*Some files and directories are omitted for brevity.*

## Getting Started

### Prerequisites

Install or prepare the following:

- Node.js and npm.
- Git.
- A MongoDB database, such as MongoDB Atlas.
- A Cloudinary account for media uploads.

### 1. Clone the repository

```bash
git clone https://github.com/KunalBehani/Circle-Up.git
cd Circle-Up
```

### 2. Install dependencies

Install the root, frontend, and backend dependencies:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 3. Configure the backend

Create a file named `server/.env`:

```env
PORT=5002
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Replace the placeholder values with your own configuration. Never commit real credentials to GitHub.

### 4. Configure the frontend

Create `client/.env.local` with the following:

```env
VITE_API_BASE_URL=/api
```

The local Vite development server proxies `/api` requests to `http://localhost:5002`, as configured in `client/vite.config.js`.

If your backend uses a different local port, update the Vite proxy configuration to match.

### 5. Start the application

Open two terminal windows from the project root.

**Terminal 1 — Backend**

```bash
npm run dev:server
```

**Terminal 2 — Frontend**

```bash
npm run dev:client
```

Open the local URL printed by Vite, usually `http://localhost:5173` or another available port.

### Available Root Commands

| Command | Description |
|---|---|
| `npm run dev:client` | Start the Vite frontend |
| `npm run dev:server` | Start the backend in watch mode |
| `npm run build` | Build the frontend for production |
| `npm run test:client` | Run frontend tests |
| `npm run test:server` | Run backend tests |
| `npm test` | Run both test suites |
| `npm run seed` | Run the backend seed script |

## Environment Variables

Configure these variables in the appropriate environment. Frontend variables prefixed with `VITE_` are exposed to browser code, so they must never contain secrets.

| Variable | Used by | Purpose |
|---|---|---|
| `PORT` | Backend | Server port; Render supplies this in production |
| `NODE_ENV` | Backend | Runtime environment |
| `MONGODB_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Secret used to sign and verify JWTs |
| `JWT_EXPIRES_IN` | Backend | JWT lifetime, such as `7d` |
| `CLIENT_URL` | Backend | Allowed frontend origin |
| `CLOUDINARY_CLOUD_NAME` | Backend | Cloudinary account identifier |
| `CLOUDINARY_API_KEY` | Backend | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Backend | Cloudinary API secret |
| `VITE_API_BASE_URL` | Frontend | Base URL for API requests |

For production, configure the backend variables in Render and `VITE_API_BASE_URL` in Vercel. The production frontend API base URL should point to the deployed backend API, for example:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

Replace the example hostname with your actual Render service URL.

## API Overview

The backend mounts its API routes under `/api`.

| Endpoint | Purpose |
|---|---|
| `/api/health` | Backend health check |
| `/api/auth` | Authentication routes |
| `/api/communities` | Community operations |
| `/api/posts` | Post operations |
| `/api/comments` | Comment operations |
| `/api/search` | Search operations |
| `/api/users` | User-related operations |

These are route prefixes, not a complete endpoint specification. For the exact HTTP methods, request bodies, and authentication requirements, refer to the route files in `server/src/routes/`.

### Health Check

After deploying the backend, open:

```text
https://your-render-service.onrender.com/api/health
```

A healthy response includes a status of `healthy`.

## Testing

CircleUp uses Vitest for frontend and backend tests.

Run the complete test suite:

```bash
npm test
```

Or run each suite independently:

```bash
npm run test:client
npm run test:server
```

Build the production frontend:

```bash
npm run build
```

Before deploying, verify that tests pass and that the production build completes successfully.

## Deployment

### Frontend — Vercel

1. Import the GitHub repository into Vercel.
2. Set the project root directory to `client`.
3. Select Vite as the framework preset.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Add `VITE_API_BASE_URL` with the deployed Render API URL.
7. Deploy the project.

The `client/vercel.json` configuration supports client-side routing by rewriting requests to `index.html`.

### Backend — Render

1. Create a Node.js Web Service connected to the GitHub repository.
2. Set the root directory to `server`.
3. Set the build command to `npm install`.
4. Set the start command to `npm start`.
5. Add the required backend environment variables.
6. Deploy the service and verify `/api/health`.

After obtaining the Vercel production URL, set `CLIENT_URL` in Render to that exact origin, including `https://` and without a trailing slash.

### Database — MongoDB Atlas

1. Create a MongoDB Atlas deployment.
2. Configure database access credentials.
3. Configure network access to permit connections from the backend hosting environment.
4. Set `MONGODB_URI` in Render.
5. Verify the database connection in the deployment logs.

Avoid allowing unrestricted database access unless you understand and accept the associated security risks.

### Media — Cloudinary

Configure your Cloudinary credentials as backend environment variables in Render. Media files should be uploaded by the backend, with returned asset URLs and relevant metadata stored in MongoDB.

**Note:** Render's free web services can spin down after inactivity, so the first request after an idle period may take longer.

## Security Notes

- Never commit `.env` files, JWT secrets, database credentials, or Cloudinary secrets.
- Use a strong, unique `JWT_SECRET` in production.
- Keep Cloudinary API secrets on the backend only.
- Validate and restrict uploaded file types and sizes.
- Use HTTPS for deployed frontend and backend communication.
- Configure CORS to allow only the frontend origins you intend to trust.
- Do not put private credentials in `VITE_*` environment variables.

## Future Improvements

Potential areas for further development include:

- Real-time community discussions and notifications.
- More advanced search and content discovery.
- User profiles and personalized feeds.
- Improved moderation and reporting tools.
- Pagination and performance optimizations for large communities.
- Expanded automated tests and continuous integration.
- Accessibility improvements and additional mobile UI refinements.

## Author

**Kunal Behani**

Computer Science student interested in software engineering, full-stack development, and building practical products.

- GitHub: [@KunalBehani](https://github.com/KunalBehani)
- Project Repository: [Circle-Up](https://github.com/KunalBehani/Circle-Up)

## License

This project currently uses the ISC license declared in the repository's `package.json`. See the repository's license information for the applicable terms.
