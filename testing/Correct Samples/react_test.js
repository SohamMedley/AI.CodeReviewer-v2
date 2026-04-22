import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const LiveCounter = ({ initialCount = 0 }) => {
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        document.title = `Count: ${count}`;
        
        // Cleanup function for when component unmounts
        return () => {
            document.title = 'React App';
        };
    }, [count]);

    return (
        <div className="counter-widget">
            <h3>Live Tally</h3>
            <p>Current Count: {count}</p>
            <button onClick={() => setCount(prev => prev + 1)}>Increment</button>
            <button onClick={() => setCount(initialCount)}>Reset</button>
        </div>
    );
};

LiveCounter.propTypes = {
    initialCount: PropTypes.number
};

export default LiveCounter;