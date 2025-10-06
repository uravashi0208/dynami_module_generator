# Repository Guidance

## Project Overview

- **Name**: Authentication Demo
- **Technology Stack**:
  - **Frontend**: Angular application located in `fe_angular`
  - **Backend**: Node.js/Express GraphQL service located in `backend`
- **Primary Purpose**: Demonstrate authentication flows including sign-in, registration, forgot password, and dashboard features.

## Key Directories

- **Frontend (`fe_angular`)**: Contains all Angular source code under `src/app` with feature modules for authentication and shared components.
- **Backend (`backend`)**: Houses server configuration, GraphQL schemas/resolvers, and services for authentication logic.

## Common Tasks

1. **Frontend Development**
   - Run `npm install` within `fe_angular`
   - Start dev server using `npm start`
   - Build production bundle with `npm run build`
2. **Backend Development**
   - Run `npm install` within `backend`

- Start server using `npm run dev`

## Testing

- **Frontend Unit Tests**: `npm run test` within `fe_angular`
- **Frontend E2E Tests**: `npm run e2e`
- **Backend Tests**: Add test scripts in `backend` if needed (none configured by default).

## Authentication Flow Notes

- Login and token management handled via `AuthService` on the frontend.
- Backend provides GraphQL mutations for authentication, including password reset requests.

## Contribution Tips

- Follow Angular best practices for modular architecture.
- Keep services and components well-typed and documented.
- For backend changes, ensure GraphQL schema and resolvers stay in sync.

## Support

- If additional project details are required, inspect `README.md` files in frontend and backend directories.
