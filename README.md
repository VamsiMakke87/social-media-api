
# Social Media API

## Description

A RESTful API for a social media platform that allows users to create posts, comment, like, and follow other users. Built with Node.js, Express.js, and MongoDB, the API includes JWT authentication for secure access and offers real-time notifications.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Features

- User registration and login
- Post creation, deletion, and management
- Like posts
- Follow/Unfollow functionality
- User profile management

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VamsiMakke87/social-media-api.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the API:
   ```bash
   npm start
   ```

## API Endpoints

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login to an existing account
- **PUT /api/users/:id** - Update user profile
- **DELETE /api/users/:id** - Delete a user profile
- **GET /api/users/:id** - Search for a user profile by ID
- **PUT /api/users/follow/:id** - Follow a user
- **PUT /api/users/unfollow/:id** - Unfollow a user
- **POST /api/posts** - Create a new post
- **PUT /api/posts/:id** - Update an existing post
- **DELETE /api/posts/:id** - Delete a post
- **PUT /api/posts/like/:id** - Like a post
- **GET /api/posts/feed/all** - Get the feed of a user (including followed users' posts)
- **GET /api/posts/feed/:id** - Get posts from a specific user's feed
