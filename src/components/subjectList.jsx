// function studentcard(props) {
//   return (
//     <div>
//       <h2>Welcome {props.name}!</h2>
//       <p>Grade: {props.grade}</p>
//       <p>Hobby: {props.hobby}</p>
//     </div>
//   );
// }

// export default studentcard;

// This component displays a list of subject using .map()
function SubjectList(props){
    //props.subject is expected to be an array of strings

    return(
        <div>
            <h3>My Subjects</h3>
            <ul>
                {/* This is our comments: .map() loops through each subject in the array */}
                {/* For each subjects, it returns a <li> elements */}
                {/* The 'key' is prop is required by React - It helps React to understand */}
                {/* Identify which item in the list changed */}
                {props.subjects.map((subject, index) => (
                    <li key={index}>{subject}</li>
                ))}
            </ul>
        </div>
    )
}

export default SubjectList;