function fetchUserScores(userIds) {
    var totalScore = 0;
    
    // ERROR: 'var' inside a loop with an asynchronous callback causes scoping issues
    for (var i = 0; i < userIds.length; i++) {
        setTimeout(function() {
            console.log("Fetching score for user index: " + i);
            // Simulated API response
            let score = Math.floor(Math.random() * 100);
            totalScore += score;
        }, 1000);
    }
    
    // ERROR: Will return 0 because it doesn't wait for the timeouts to finish
    console.log("Final Output:", totalScore);
    return totalScore;
}

fetchUserScores([101, 102, 103]);