import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionsRouter = Router();

// Create a new question
questionsRouter.post("/", async (req, res) => {
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
        return res.status(400).json({ message: "Invalid request data." });
    }

    try {
        await connectionPool.query(
            `INSERT INTO questions (title, description, category) VALUES ($1, $2, $3)`,
            [title, description, category]
        );
        return res.status(201).json({ message: "Question created successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to create question." });
    }
});

// Search questions (MUST BE BEFORE GET /:id)
questionsRouter.get("/search", async (req, res) => {
    const { title, category } = req.query;

    if (!title && !category) {
        return res.status(400).json({ message: "Invalid search parameters." });
    }

    try {
        let query = "SELECT * FROM questions WHERE 1=1";
        let values = [];
        let counter = 1;

        if (title) {
            query += ` AND title ILIKE $${counter}`;
            values.push(`%${title}%`);
            counter++;
        }

        if (category) {
            query += ` AND category ILIKE $${counter}`;
            values.push(`%${category}%`);
            counter++;
        }

        const result = await connectionPool.query(query, values);
        return res.status(200).json({ data: result.rows });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to fetch questions." }); // Using generic error based on spec, though spec says "Unable to fetch a question" for search? Spec says "Unable to fetch a question." for search error 500.
    }
});

// Get all questions
questionsRouter.get("/", async (req, res) => {
    try {
        const result = await connectionPool.query("SELECT * FROM questions");
        return res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to fetch questions." });
    }
});

// Get a question by ID
questionsRouter.get("/:id", async (req, res) => {
    const questionId = req.params.id;
    try {
        const result = await connectionPool.query(
            `SELECT * FROM questions WHERE id = $1`,
            [questionId]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ message: "Question not found." });
        }
        return res.status(200).json({ data: result.rows[0] });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Unable to fetch questions." }); // Spec says "Unable to fetch questions." for ID too? "Unable to fetch questions." in GET /questions/:questionId
    }
});

// Update a question by ID
questionsRouter.put("/:id", async (req, res) => {
    const questionId = req.params.id;
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ message: "Invalid request data." });
    }

    try {
        const result = await connectionPool.query(
            `UPDATE questions SET title = $2, description = $3, category = $4 WHERE id = $1 RETURNING *`,
            [questionId, title, description, category]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Question not found." });
        }

        return res.status(200).json({ message: "Question updated successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to fetch questions." }); // Spec error message copy-paste likely? "Unable to fetch questions."
    }
});

// Delete a question by ID
questionsRouter.delete("/:id", async (req, res) => {
    const questionId = req.params.id;
    try {
        const result = await connectionPool.query(
            `DELETE FROM questions WHERE id = $1`,
            [questionId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Question not found." });
        }

        return res.status(200).json({
            message: "Question post has been deleted successfully.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to delete question." });
    }
});

// --- Answers Endpoints under Questions ---

// Create an answer for a question
questionsRouter.post("/:id/answers", async (req, res) => {
    const questionId = req.params.id;
    const { content } = req.body;

    if (!content || content.length > 300) { // Spec says max 300 chars
        return res.status(400).json({ message: "Invalid request data." });
    }

    try {
        // Check if question exists first? Constraints handles FK but 404 is nice.
        // However, FK error usually throws 500 or constraint error.
        // Let's rely on constraint for now or simple check.
        // Spec shows 404 Not Found for POST answer.
        const questionCheck = await connectionPool.query("SELECT * FROM questions WHERE id = $1", [questionId]);
        if (questionCheck.rowCount === 0) {
            return res.status(404).json({ message: "Question not found." });
        }

        await connectionPool.query(
            `INSERT INTO answers (question_id, content) VALUES ($1, $2)`,
            [questionId, content]
        );

        return res.status(201).json({ message: "Answer created successfully." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to create answers." });
    }
});

// Get answers for a question
questionsRouter.get("/:id/answers", async (req, res) => {
    const questionId = req.params.id;

    try {
        const questionCheck = await connectionPool.query("SELECT * FROM questions WHERE id = $1", [questionId]);
        if (questionCheck.rowCount === 0) {
            return res.status(404).json({ message: "Question not found." });
        }

        const result = await connectionPool.query(
            `SELECT * FROM answers WHERE question_id = $1`,
            [questionId]
        );

        return res.status(200).json({ data: result.rows });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to fetch answers." });
    }
});

// Delete answers for a question (ALL answers)
questionsRouter.delete("/:id/answers", async (req, res) => {
    const questionId = req.params.id;

    try {
        const questionCheck = await connectionPool.query("SELECT * FROM questions WHERE id = $1", [questionId]);
        if (questionCheck.rowCount === 0) {
            return res.status(404).json({ message: "Question not found." });
        }

        await connectionPool.query(
            `DELETE FROM answers WHERE question_id = $1`,
            [questionId]
        );

        return res.status(200).json({
            message: "All answers for the question have been deleted successfully.",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to delete answers." });
    }
});

// Vote on a question
questionsRouter.post("/:id/vote", async (req, res) => {
    const questionId = req.params.id;
    const { vote } = req.body;

    if (vote !== 1 && vote !== -1) {
        return res.status(400).json({ message: "Invalid vote value." });
    }

    try {
        const questionCheck = await connectionPool.query("SELECT * FROM questions WHERE id = $1", [questionId]);
        if (questionCheck.rowCount === 0) {
            return res.status(404).json({ message: "Question not found." });
        }

        await connectionPool.query(
            `INSERT INTO question_votes (question_id, vote) VALUES ($1, $2)`,
            [questionId, vote]
        );

        return res.status(200).json({
            message: "Vote on the question has been recorded successfully.",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to vote question." });
    }
});

export default questionsRouter;
