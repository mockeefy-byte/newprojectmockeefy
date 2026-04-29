import axios from 'axios';

const testAPI = async () => {
    try {


        // Test 1: Get all verified experts

        const response = await axios.get('http://localhost:3000/api/expert/verified');

        if (response.data.success) {
            const experts = response.data.data;


            // Group by category
            const byCategory = {};
            experts.forEach(expert => {
                const category = expert.personalInformation?.category || 'Unknown';
                if (!byCategory[category]) byCategory[category] = [];
                byCategory[category].push(expert);
            });





        } else {

        }

    } catch (error) {
        console.error('❌ Error testing API:', error.message);
        if (error.response) {


        }
    }
};

testAPI();
