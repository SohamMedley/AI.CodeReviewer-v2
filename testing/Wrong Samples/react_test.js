import React, { useState } from 'react';

function UserDashboard({ users }) {
    const [userList, setUserList] = useState(users);

    const reverseList = () => {
        // ERROR: Mutating state directly instead of copying
        let reversed = userList.reverse();
        setUserList(reversed);
    };

    return (
        <div className="dashboard">
            <h2>User Roster</h2>
            <button onClick={reverseList}>Reverse Order</button>
            <ul>
                {userList.map(user => {
                    // ERROR: Missing unique key prop in list rendering
                    return <li>{user.name} - {user.role}</li>
                })}
            </ul>
        </div>
    );
}
export default UserDashboard;