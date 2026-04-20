const axios = require('axios');

async function quickTest() {
    try {
        console.log('Testing Gemini API...\n');
        
        const response = await axios.post('http://localhost:5000/api/gemini/chat', {
            message: 'EBookFarm là gì?',
            conversationHistory: []
        });

        console.log('Success:', response.data.success);
        if (response.data.success) {
            console.log('\nAI Response:');
            console.log(response.data.data.response);
        } else {
            console.log('\nError:', response.data.message);
            console.log('Details:', response.data.error);
        }
    } catch (error) {
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Response data:', error.response.data);
        }
    }
}

quickTest();
