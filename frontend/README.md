# Chat Application Frontend

React TypeScript frontend for the chat application.

## Development

Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## API Proxy

The Vite dev server is configured to proxy API requests to the backend:
- Frontend requests to `/api/*` are proxied to `http://localhost:8001/*`

This means:
- `GET /api/user/1` → `GET http://localhost:8001/user/1`
- `POST /api/user/login` → `POST http://localhost:8001/user/login`

## Project Structure

```
src/
├── components/    # React components
├── services/      # API client services
├── types/         # TypeScript type definitions
├── hooks/         # Custom React hooks
├── context/       # React Context providers
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## Full Stack Development

To run both frontend and backend together from the project root:
```bash
npm run dev
```

This will start:
- Backend: http://localhost:8001
- Frontend: http://localhost:5173

## Expanding the ESLint configuration

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
