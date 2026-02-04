

const BASE_URL = "http://localhost:4000";

async function testAPI() {
    console.log("Starting API Verification...");

    try {
        // 1. Create a Question
        console.log("\nTesting POST /questions...");
        const createRes = await fetch(`${BASE_URL}/questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Test Question",
                description: "This is a test description",
                category: "Test"
            }),
        });
        console.log("Status:", createRes.status);
        console.log("Response:", await createRes.json());

        // 2. Get All Questions
        console.log("\nTesting GET /questions...");
        const getAllRes = await fetch(`${BASE_URL}/questions`);
        const allQuestions = await getAllRes.json();
        console.log("Status:", getAllRes.status);
        // console.log("Response:", allQuestions);
        const questionId = allQuestions.data && allQuestions.data.length > 0 ? allQuestions.data[allQuestions.data.length - 1].id : null;

        if (!questionId) {
            console.error("No question created, aborting further tests.");
            return;
        }
        console.log("Using Question ID:", questionId);

        // 3. Get Question by ID
        console.log(`\nTesting GET /questions/${questionId}...`);
        const getByIdRes = await fetch(`${BASE_URL}/questions/${questionId}`);
        console.log("Status:", getByIdRes.status);
        console.log("Response:", await getByIdRes.json());

        // 4. Update Question
        console.log(`\nTesting PUT /questions/${questionId}...`);
        const updateRes = await fetch(`${BASE_URL}/questions/${questionId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Updated Title",
                description: "Updated Description",
                category: "Updated Category"
            }),
        });
        console.log("Status:", updateRes.status);
        console.log("Response:", await updateRes.json());

        // 5. Search Question
        console.log(`\nTesting GET /questions/search...`);
        const searchRes = await fetch(`${BASE_URL}/questions/search?title=Updated`);
        console.log("Status:", searchRes.status);
        console.log("Response:", await searchRes.json());


        // 6. Create Answer
        console.log(`\nTesting POST /questions/${questionId}/answers...`);
        const createAnsRes = await fetch(`${BASE_URL}/questions/${questionId}/answers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: "This is a test answer"
            }),
        });
        console.log("Status:", createAnsRes.status);
        console.log("Response:", await createAnsRes.json());

        // 7. Get Answers
        console.log(`\nTesting GET /questions/${questionId}/answers...`);
        const getAnsRes = await fetch(`${BASE_URL}/questions/${questionId}/answers`);
        const answersData = await getAnsRes.json();
        console.log("Status:", getAnsRes.status);
        // console.log("Response:", answersData);
        const answerId = answersData.data && answersData.data.length > 0 ? answersData.data[0].id : null;

        // 8. Vote Question
        console.log(`\nTesting POST /questions/${questionId}/vote...`);
        const voteQRes = await fetch(`${BASE_URL}/questions/${questionId}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vote: 1 }),
        });
        console.log("Status:", voteQRes.status);
        console.log("Response:", await voteQRes.json());

        // 9. Vote Answer
        if (answerId) {
            console.log(`\nTesting POST /answers/${answerId}/vote...`);
            const voteARes = await fetch(`${BASE_URL}/answers/${answerId}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vote: -1 }),
            });
            console.log("Status:", voteARes.status);
            console.log("Response:", await voteARes.json());
        }

        // 10. Delete Answers
        console.log(`\nTesting DELETE /questions/${questionId}/answers...`);
        const deleteAnsRes = await fetch(`${BASE_URL}/questions/${questionId}/answers`, {
            method: "DELETE"
        });
        console.log("Status:", deleteAnsRes.status);
        console.log("Response:", await deleteAnsRes.json());

        // 11. Delete Question
        console.log(`\nTesting DELETE /questions/${questionId}...`);
        const deleteQRes = await fetch(`${BASE_URL}/questions/${questionId}`, {
            method: "DELETE"
        });
        console.log("Status:", deleteQRes.status);
        console.log("Response:", await deleteQRes.json());

    } catch (error) {
        console.error("Error during verification:", error);
    }
}

testAPI();
