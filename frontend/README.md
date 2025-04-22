# Ecosphere Frontend

This is the frontend application for the Ecosphere Starter project, built with Vue 3, Vite, and Tailwind CSS.

## Features

- **Modern Stack**: Vue 3 with Composition API and `<script setup>` syntax
- **State Management**: Pinia for state management
- **Routing**: Vue Router for client-side routing
- **Styling**: Tailwind CSS for utility-first styling
- **Dark Mode**: Full dark mode support with system preference detection
- **API Integration**: Axios for API requests with token refresh handling
- **Responsive Design**: Mobile-friendly interface

## Project Structure

```
frontend/
│
├── public/              # Public static assets
├── src/                 # Source code
│   ├── api/             # API service layer
│   ├── assets/          # Static assets like CSS, images
│   ├── components/      # Reusable Vue components
│   │   └── layout/      # Layout components (NavBar, etc.)
│   ├── composables/     # Vue composables (reusable logic)
│   ├── router/          # Vue Router configuration
│   ├── store/           # Pinia stores
│   ├── utils/           # Utility functions
│   ├── views/           # Page components
│   │   ├── admin/       # Admin pages
│   │   ├── auth/        # Authentication pages
│   │   └── profile/     # User profile pages
│   ├── App.vue          # Root component
│   └── main.js          # Application entry point
│
├── index.html           # HTML entry point
├── package.json         # Project dependencies and scripts
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.js       # Vite configuration
```

## Key Components

### Authentication

- **Login**: User authentication with JWT
- **Register**: New user registration
- **Auth Store**: JWT token management with automatic refresh

### User Profile

- **Profile Management**: Update personal information
- **Password Changes**: Secure password updating with strength validation

### Admin Features

- **User List**: Admin view of all system users
- **User Detail**: Detailed user management interface

## Setup and Installation

### Prerequisites

- Node.js (v14 or newer recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/Ecosphere-Starter.git
   cd Ecosphere-Starter/frontend
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Create a `.env` file (optional):
   ```
   VITE_API_URL=http://localhost:8000
   ```

### Development

Run the development server:
```
npm run dev
# or
yarn dev
```

This will start the development server at `http://localhost:5173`.

### Building for Production

Create a production build:
```
npm run build
# or
yarn build
```

This will generate optimized files in the `dist` directory.

## Integration with Backend

The frontend is designed to work with the Django backend API. The application automatically handles:

- JWT authentication
- Token refreshing
- API request/response formatting
- Error handling

## Customizing the UI

### Themes

The application supports both light and dark modes. You can customize the theme colors in:

```
tailwind.config.js
```

The default primary and secondary colors can be modified to match your branding.

### Components

All UI components are built with Tailwind CSS for consistent styling and easy customization.

## License

[MIT License](LICENSE)

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.