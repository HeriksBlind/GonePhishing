document.getElementById('classifyButton').addEventListener('click', async () => {
    const emailText = document.getElementById('emailText').value;
    const resultElement = document.getElementById('result');

    if (!emailText) {
        resultElement.textContent = 'Please enter some email text.';
        return;
    }

    const prediction = await classifyEmail(emailText);
    resultElement.textContent = `Prediction: ${prediction}`;
});

async function classifyEmail(emailText) {
    try {
        const response = await fetch('http://localhost:5000/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email_text: emailText }),
        });

        if (!response.ok) {
            throw new Error('Failed to classify email');
        }

        const data = await response.json();
        console.log("Response from backend:", data);  // Log the response
        return data.prediction;
    } catch (err) {
        console.error('Error classifying email:', err);
        return 'Error';
    }
}