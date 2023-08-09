import React, {useState} from 'react'
import styled from "styled-components";
import Picker from "emoji-picker-react";
import{IoMdSend} from 'react-icons/io'
import{BsEmojiSmileFill} from 'react-icons/bs'
import EmojiPicker from 'emoji-picker-react';

export default function ChatInput({handleSendMsg}) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [msg,setMsg]= useState("");

    const handleEmojiPickerHideShow = () => {
        //will hide and show
        setShowEmojiPicker(!showEmojiPicker);
    }

    const handleEmojiClick = (emoji,event) =>
    {
        console.log("emoji: ", emoji)
        let message = msg;
        message = message + emoji.emoji;
        setMsg(message);
    }

    const sendChat = (event) => {
        event.preventDefault();
        if(msg.length>0){
            handleSendMsg(msg);
            setMsg('')
        }
    }
  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
            <BsEmojiSmileFill onClick={handleEmojiPickerHideShow}/>
            {
                showEmojiPicker && 
                (
                <PickerContainer>
                    <EmojiPicker  onEmojiClick = {handleEmojiClick} />
                </PickerContainer>
                )
            }
        </div>
      </div>
      <form className = "input-container" onSubmit ={(e)=>sendChat(e)}>
            <input type = "text" placeholder = "type your message here" value ={msg} onChange ={(e)=>setMsg(e.target.value)}/>
            <button className = "submit">
                <IoMdSend/>
            </button>
      </form>
    </Container>
  )
};

//. is used for class names
//. is not used when element type (such as div, img etc. are used)
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
        button 
        {
            padding: 0.3rem 2rem;
            border-radius: 2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #9a86f3;
            border:none;
            margin-left: auto;
            svg {
                font-size: 2rem;
                color:white;
            }
        }
    }


`;


const PickerContainer = styled.div`
  position: absolute;
  top: -525px; /* Adjust this value to move the menu upwards */
  right: 90px;
  background-color: #080420;
  border: 1px solid #ccc;
  padding: 0.5rem;
`;