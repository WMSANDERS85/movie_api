# MyFilx_API

## Table of Contents

- [Overview](#Overview)
- [Links](#Links)
- [Process](#process)
  - [Programming Languages](#Programming-Languages)
  - [Dependencies](#Dependencies)
- [Features](#Features)

## Overview

The MyFlix web application will provide users with access to information about different movies, directors, and genres.

Users will be able to sign up, update their personal information and create a list of their favorite movies.

## Links

- [Documentation](https://myflix-movies-app-3c39c5149294.herokuapp.com/documentation)
- [API](https://myflix-movies-app-3c39c5149294.herokuapp.com)
- [Code URL](https://github.com/WMSANDERS85/movie_api)

## Process

### Programming Languages

- JavaScript
- HTML
- CSS

### Dependencies

- [MongoDB version 6.06](https://www.mongodb.com/)
- [Node.js version 18.16.0](https://nodejs.org/en)

  - bcrypt 5.1.0,
  - body-parser 1.20.2
  - cors 2.8.5
  - express 4.18.2
  - express-validator 7.0.1
  - jsonwebtoken 9.0.0
  - mongoose 7.3.1
  - morgan 1.10.0
  - passport 0.6.0
  - passport-jwt 4.0.1
  - passport-local 1.0.0

- [ESLint](https://eslint.org/)
  - eslint 8.2.0
  - eslint-config-airbnb 19.0.4
  - eslint-config-node 4.1.0
  - eslint-config-prettier 8.8.0
  - eslint-plugin-import 2.25.3
  - eslint-plugin-jsx-a11y 6.5.1
  - eslint-plugin-node 11.1.0
  - eslint-plugin-prettier 4.2.1
  - eslint-plugin-react 7.28.0
  - eslint-plugin-react-hooks 4.3.0
  - [ESLint Rules](https://github.com/WMSANDERS85/movie_api/blob/main/.eslintrc.json)
- [Prettier](https://prettier.io/)
  - [Prettier Rules](https://github.com/WMSANDERS85/movie_api/blob/main/.prettierrc)

## Features

### Data Operations Enabled by HTTP Requests

- Returns a list of ALL movies to the user
- Returns data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
- Returns data about a genre (description) by name/title (e.g., “Drama”)
- Returns all movies with a certain genre by name/title
- Returns data about a director (bio, birth year, death year) by name
- Returns all movies by a certain director by name
- Allows new users to register
- Allows users to update their user info (username, password, email, date of birth)
- Allows users to add a movie to their list of favorites
- Allows users to remove a movie from their list of favorites
- Allows existing users to deregister

### Data Validation and Authorization

Basic HTTP authentication has been implemented for user login, and JWT-based authenticaion for all other requests. New user registration is accessible to anonymous users.

### Data Validation and Security

CORS middleware has been implemented and password hashing is enabled.
