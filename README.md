# Backend Skill Checkpoint - Express Server

This acts as an API for the Q&A Platform.

## Features
- **Questions**: Create, Read, Update, Delete, Search questions.
- **Answers**: Add answers to questions, view answers, delete all answers for a question.
- **Votes**: Upvote or Downvote questions and answers.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   - Ensure PostgreSQL is running.
   - Configure connection string in `utils/db.mjs`.
   - Run setup script to create tables:
     ```bash
     node utils/setup_db.mjs
     ```

3. **Run Server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:4000`.

## API Endpoints

### Questions
- `POST /questions`: Create a new question.
- `GET /questions`: Get all questions.
- `GET /questions/:id`: Get a specific question.
- `PUT /questions/:id`: Update a question.
- `DELETE /questions/:id`: Delete a question.
- `GET /questions/search?title=...&category=...`: Search questions.

### Answers
- `POST /questions/:id/answers`: Add an answer.
- `GET /questions/:id/answers`: Get answers for a question.
- `DELETE /questions/:id/answers`: Delete all answers for a question.

### Voting
- `POST /questions/:id/vote`: Vote on a question (`{ vote: 1 }` or `{ vote: -1 }`).
- `POST /answers/:id/vote`: Vote on an answer (`{ vote: 1 }` or `{ vote: -1 }`).
