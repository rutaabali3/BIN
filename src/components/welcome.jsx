// Welcome.jsx
// This is a functional component called Welcome.
// Its Accepts a prop called 'name' and display a greeting

// function Welcome(props){
//     // 'Return' keyword send back jsx (visual part of the component)
//     // Everything inside the return is well be appear on the screen 
    
//     return(
//         <div>
//             <h2>Welcome, {props.name}</h2>
//             <p>We are glad you are here, International Students.</p>
//         </div>
//     )
// }

// // 'export default' amkes this component avaialable to other files.

// export default Welcome;



function Welcome(props) {
  return (
    <div>
      <h2>Welcome, {props.name}!</h2>
      <p>Age: {props.age}</p>
      <p>Subject: {props.subject}</p>
    </div>
  );
}

export default Welcome;
