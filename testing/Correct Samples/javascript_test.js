/**
 * Fetches user data from an API and processes it cleanly.
 */
async function fetchAndProcessUser(userId) {
    try {
        if (!userId || typeof userId !== 'number') {
            throw new Error('Invalid User ID provided.');
        }

        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        
        // Return a clean, destructured object mapping
        return {
            id: userData.id,
            fullName: userData.name,
            contactEmail: userData.email.toLowerCase()
        };

    } catch (error) {
        console.error("Data Processing Failed:", error.message);
        return null;
    }
}

// Example Execution
fetchAndProcessUser(1).then(result => console.log(result));