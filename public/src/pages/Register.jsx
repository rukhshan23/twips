import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { registerRoute } from "../utils/APIRoutes";

function Register() {
    const [values, setValues] = useState({
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    })

    const toastOptions = {
      position: "bottom-right",
      autoClose: 1000,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        if(handleValidation())
        {
          console.log("in validation",registerRoute)
          /* using axios to send a register route post request */
          const {password, confirmPassword, username, email} = values;
          const {data} = await axios.post(registerRoute, {
            username,
            email,
            password,
          });
        }
    };

    const handleValidation = () => {
      //key matching
      const {password, confirmPassword, username, email} = values;
      
      if (username === "") {
        toast.error("Please enter a username.", toastOptions);
        return false;
      }
      else if (email === "") {
        toast.error("Please enter an email.", toastOptions);
        return false;
      }
      else if (password !== confirmPassword)
      {
        toast.error("Password and confirm password should be same.", toastOptions);
        return false;
      }
      else if (password === "") {
        toast.error("Please enter a password.", toastOptions);
        return false;
      }

      return true;
      


       
    };


    const handleChange = (event) => {

        setValues({ ...values, [event.target.name]: event.target.value});
    };


  return (
    <>
     {/* Styled component for the outer container of the form */}
    <FormContainer> 
        {/* When button with type = "submit" is clicked, call handleSubmit */}
        <form onSubmit={(event)=>handleSubmit(event)}>

            <div className = "brand">
                <img src = {Logo} alt="Logo" />
                <h1>snappy</h1>
            </div>
            <input type = "text" placeholder = "Username" name ="username" onChange={(e) => handleChange(e)}/>
            <input type = "email" placeholder = "Email" name ="email" onChange={(e) => handleChange(e)}/>
            <input type = "password" placeholder = "Password" name ="password" onChange={(e) => handleChange(e)}/>
            <input type = "password" placeholder = "Confirm Password" name ="confirmPassword" onChange={(e) => handleChange(e)}/>


            <button type = "submit"> Create User </button>
            <span>Already have an account? <Link to="/login">Login</Link></span>

        </form>
    </FormContainer>
    <ToastContainer />
    </>

  );
}

const FormContainer = styled.div`
  //
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  
  //nested selector, class name "brand" inside FormContainer 
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 5rem;
    }
    h1 {
      color: white;
      text-transform: uppercase;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #00000076;
    border-radius: 2rem;
    padding: 3rem 5rem;
  }
  input {
    background-color: transparent;
    padding: 1rem;
    border: 0.1rem solid #4e0eff;
    border-radius: 0.4rem;
    color: white;
    width: 100%;
    font-size: 1rem;
    &:focus {
      border: 0.1rem solid #997af0;
      outline: none;
    }
  }
  button {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    &:hover {
      background-color: #4e0eff;
    }
  }
  span {
    color: white;
    text-transform: uppercase;
    a {
      color: #4e0eff;
      text-decoration: none;
      font-weight: bold;
    }
  }
`;

export default Register;
