// This component demonstrate JSX expression
function ProfileCard(props) {
  //These are local variables inside the component
  const fullName = props.firstName + " " + props.lastName;

  //Calculate the birth years using the current year and the age prop
  const birthYear = 2026 - props.age;
  return (
    <div className="profile-card">
      <h2>{fullName}</h2>
      {/* We are using ternary operator */}
      {/* Syntax: condition ? 'if true' : 'if false' */}
      <p>Status: {props.age >= 18 ? 'Adult' : 'Student'}</p>

      <p>Age:{props.age}</p>
      <p>Birth Year: {birthYear}</p>
    </div>
  )
}

export default ProfileCard;
