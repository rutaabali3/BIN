import { useState } from 'react'

function UserForm() {
    const [name, setName] = useState('');
    const [submittedName, setSubmittedName] = useState('');

    //Runs whenever the user types in the input field
    function handleChange(event) {
        //Update state with the latest input value
        setName(event.target.value);
    }

    //Runs when the form is submitted
    function handleSubmit(event) {
        //Prevent page refresh (default form behaviour)
        event.preventDefault();

        //Save the entered name:
        setSubmittedName(name);

        //Clear the input field after submission
        setName('');
    }

    return (
        <div>
            <h2>User Form</h2>

            {/* Form submission event: */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={handleChange}
                    placeholder="Enter your Name"
                />

                {/* Clicking this button triggers onSubmit */}
                <button type="submit">
                    Submit
                </button>
            </form>

            {/* Show message only after form submission */}
            {submittedName && (
                <p>Welcome, {submittedName}!</p>
            )}
        </div>
    )
}

export default UserForm;
