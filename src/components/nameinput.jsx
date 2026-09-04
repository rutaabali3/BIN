import { useState } from "react";

function NameInput() {
    const [name, setName]  = useState('')

    function handleChange(event){
        setName(event.target.value);
    }
    return(
        <div>
            <h2>Type Your Answer</h2>
            <input type="text" value={name} onChange={handleChange} placeholder="Type your name"/>
            {name.length > 0 && <p>Hello, {name}! Welcome To React</p>}
        </div>
    )
}

export default NameInput