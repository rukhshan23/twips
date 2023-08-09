import React, {useState} from 'react'
import styled from "styled-components";
import Picker from "emoji-picker-react";
import{IoMdSend} from 'react-icons/io'
import{BsEmojiSmileFill} from 'react-icons/bs'

export default function ChatInput() {
  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
            <BsEmojiSmileFill/>
        </div>
      </div>
      <form className = "input-container">
            <input type = "text" placeholder = "type your message here"/>
            <button className = "submit">
                <IoMdSend/>
            </button>
      </form>
    </Container>
  )
};


const Container = styled.div`
display: grid;
grid-template-columns: 5% 95%;
align-items: center;
background-color: #080420;
padding: 0.2rem;
padding-bottom: 0.3rem;

.button-container
{
    display:flex;
    align-items: center;
    color: black;
    gap: 1rem;

    .emoji
    {
        position: relative;
        svg
        {
            font-size: 2rem;
            color: yellow;
            cursor: pointer;
            
        }
    }
}

    .input-container{
        width: 100%;
        border-radius: 2rem;
        display: flex;
        align-content: center;
        gap: 2rem;
        background-color: #ffffff34;
        input{
            width: 80%;
            height: 60%;
            background-color: transparent;
            color: white;
            border: none;
            padding-left: 1rem;
            font-size: 1.2rem;
            &::selection{
                background-color: white;
            }
            &:focus{
                outline: none;
            }
        }
        .button 
        {
            padding: 0.3rem 2rem;
            border-radius: 2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #9a86f3;
            border:none;
            svg {
                font-size: 2rem;
                color:white;
            }
        }
    }


`;