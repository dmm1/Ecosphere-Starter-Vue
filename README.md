# Ecosphere-Starter 🌱

A modern, secure Django 5.2 starter template with JWT authentication, WebSockets, and best practices built-in.

## Features ✨

- **Django 5.2** - Latest Django version with all its features and security improvements
- **Modern Authentication** - JWT-based authentication system with token refresh
- **Custom User Model** - Email-based user authentication instead of the Django default username
- **Security Best Practices** - Configured with security in mind:
  - BCrypt password hashing
  - CORS protection
  - Django-Axes for brute force protection
  - Security headers in production
- **WebSocket Support** - Real-time capabilities using Django Channels (with optional Redis backend)
- **API Documentation** - Swagger UI for exploring and testing the API
- **Testing Ready** - Pytest and Factory Boy for efficient testing
- **Frontend Ready** - CORS configured for modern frontend frameworks

## Quick Start 🚀

### Prerequisites

- Python 3.10+
- Redis (optional - for production WebSocket channels)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/Ecosphere-Starter.git
   cd Ecosphere-Starter
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file in the project root (or use the existing one):
   ```
   DEBUG=True
   SECRET_KEY=your-secret-key
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   
   # Redis configuration (optional)
   USE_REDIS=False
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   ```

5. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

For WebSockets functionality with Redis, set `USE_REDIS=True` in your .env file and make sure Redis is running and accessible. If you don't have Redis available, the project will use an in-memory channel layer that works for development but isn't suitable for production.

## Project Structure 📁

```
Ecosphere-Starter/
│
├── account/                  # Account app with authentication and user management
│   ├── migrations/
│   ├── models.py             # Custom User and Profile models 
│   ├── serializers.py        # DRF serializers
│   ├── views.py              # API views
│   ├── urls.py               # URL routing
│   ├── consumers.py          # WebSocket consumers
│   ├── routing.py            # WebSocket routing
│   └── tests.py              # Tests using pytest and factory-boy
│
├── core/                     # Project core settings
│   ├── settings.py           # Project settings
│   ├── urls.py               # Main URL routing
│   ├── asgi.py               # ASGI config for WebSockets
│   └── wsgi.py               # WSGI config
│
├── templates/                # Template files
│   └── swagger-ui.html       # Swagger UI template
│
├── .env                      # Environment variables
├── .gitignore                # Git ignore file
├── README.md                 # Project documentation
├── manage.py                 # Django management script
└── requirements.txt          # Project dependencies
```

## API Endpoints 🔌

### Authentication

- `POST /api/account/register/` - Register a new user
- `POST /api/account/login/` - Login and get JWT tokens
- `POST /api/account/logout/` - Logout (blacklist refresh token)
- `POST /api/account/token/refresh/` - Refresh access token

### User Management

- `GET/PATCH /api/account/profile/` - Retrieve or update user profile
- `POST /api/account/change-password/` - Change user password

### Admin Only

- `GET /api/account/users/` - List all users
- `GET/PUT/DELETE /api/account/users/<id>/` - Manage specific user

### API Documentation

- `/api/docs/` - Swagger UI for API documentation
- `/api/schema/` - OpenAPI schema

## WebSockets 🔄

The project includes WebSocket support for real-time features:

- `/ws/notifications/` - Real-time notification endpoint

### WebSocket Configuration

By default, the project uses Django Channels' in-memory layer for WebSockets, which is suitable for development but not for production.

To use Redis as the channel layer backend (recommended for production):

1. Make sure Redis is installed and running
2. Set the following in your `.env` file:
   ```
   USE_REDIS=True
   REDIS_HOST=127.0.0.1  # Your Redis host
   REDIS_PORT=6379       # Your Redis port
   ```

For development without Redis, set `USE_REDIS=False` and the project will use the in-memory channel layer.

## Customization 🔧

This starter is designed to be easily customizable:

1. Rename the project:
   - Update references to "Ecosphere" in settings, URLs, and documentation
   - Update import paths in Python files

2. Add your own apps:
   ```bash
   python manage.py startapp your_app_name
   ```

3. Modify settings in `core/settings.py` as needed

4. Extend the user model or authentication logic in the account app

## Testing 🧪

Run tests using pytest:

```bash
pytest
```

## Deployment 🚢

For production deployment:

1. Set `DEBUG=False` in your .env file
2. Configure proper `SECRET_KEY`, `ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS`
3. Set up a production database (PostgreSQL recommended)
4. Configure proper settings for your hosting environment

## License 📜

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments 🙏

- Django project
- Django REST Framework
- SimpleJWT
- Django Channels