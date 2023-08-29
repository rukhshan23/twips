import React, {useState, useEffect} from 'react'
import styled from "styled-components";
import Picker from "emoji-picker-react";
import{IoMdSend} from 'react-icons/io'
import{BsEmojiSmileFill} from 'react-icons/bs'
import EmojiPicker from 'emoji-picker-react';
import axios from "axios"
import {getAllMessagesRoute} from "../utils/APIRoutes"
import {LLMPreviewPipeLine, generateResponse,LLMProactivePipeLine} from './LLMInterpretation.jsx'


export default function ChatInput({handleSendMsg}) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [msg,setMsg]= useState("");
    const [preview, setPreview] = useState(false)
    const [previewText, setPreviewText] = useState(""); 
    const [copy, setCopy] = useState(false); 
    const [proactive, setProactive] = useState(false); 
    const [currentUser, setCurrentUser] = useState("")
  
    
    


    const handleEmojiPickerHideShow = () => {
        //will hide and show
        setShowEmojiPicker(!showEmojiPicker);
    }

    const generateRes = async() => {
        let currentConversation = await fetchChat();
        let textConversation = formatMessages(currentConversation);
        let response = await generateResponse({formattedChat:textConversation});
        handleSendMsg(response);
    }

    const fetchChat = async () => {
        try {
            setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")))
            let currentChat = await JSON.parse(localStorage.getItem("chat"))

            const response = await axios.post(getAllMessagesRoute, {
                from: currentUser._id,
                to: currentChat._id,
            });

            
            
            //const formattedChat = formatMessages(messages);
            //console.log("R data:", response.data);
            return response.data;

        } catch (error) {
            console.error('Error fetching chat:', error);
        }
    };

    const handleEmojiClick = (emoji,event) =>
    {
        //console.log("emoji: ", emoji)
        let message = msg;
        message = message + emoji.emoji;
        setMsg(message);
    }

    function formatMessages(messages) {
       
        const formattedMessages = messages.map(message => {
            
            if (message.fromSelf) {
                return `Receiver: ${message.message}`;
            } else {
                return `Sender: ${message.message}`;
            }
        });
    
        return formattedMessages.join('\n');
    }

    const handleProactive = async (resLLM) =>{

        setPreviewText(resLLM[0])
        setCopy(true)
        setPreview(true)
    }

    const handlePreview = async () =>
    {
        setProactive(true);
        if(msg===""){
            setPreviewText("")
            setPreview(false)
            return;
        }
        setPreviewText("")
        setCopy(false)
        
        
        
        let currentConversation = await fetchChat();
        
        let textConversation = formatMessages(currentConversation);
        textConversation = textConversation + "\nSender's last message: " + msg;
        //console.log("text", textConversation)
        let resLLM = await LLMPreviewPipeLine({formattedChat: textConversation, message:msg})
        setPreviewText(resLLM[0])
        if(resLLM[1] > 0)
        {
            setCopy(true)
        }
        else
        {
            setCopy(false)
        }
        setPreview(true)
        //call GPT
        //set previewText
        //setPreviewText()
    }

    const handleClose = () =>{
        setPreview(!preview)
        
    }
    const handleCopy = () =>
    {
        //setPreview(!preview)
        
        const regex = /"([^"]+)"/g; // Regular expression to match all text within double quotes
        const matches = previewText.match(regex);

        if (matches && matches.length > 0) {
        const lastMatch = matches[matches.length - 1]; // Get the last match
        const match = lastMatch.match(/"([^"]+)"/); // Match text within the last match
        if (match && match[1]) {
            setMsg(match[1]); // Return the matched text without the double quotes
            return;
        }
        }

        return; // Return if no match found





    }

    const sendChat = async (event) => {
        event.preventDefault();
        if(msg.length>0){
            
            if(proactive === false)
            {
                let currentConversation = await fetchChat();
                let textConversation = formatMessages(currentConversation);
                textConversation = textConversation + "\nSender's last message: " + msg;
                //console.log("text proactive", textConversation)
                let resLLM = await LLMProactivePipeLine({formattedChat: textConversation, message:msg})
                if(resLLM[0]!=="")
                {
                    setPreviewText(resLLM[0])
                    setCopy(true)
                    setPreview(true)
                    //false means check
                    //true means do not check proactively
                    setProactive(true)
                    console.log("Before changing proactive")
                    return;
                }
  
            }
            setProactive(false);
            setPreviewText("");
            setPreview(false);
            setCopy(false);

            handleSendMsg(msg);
            setMsg('')
        }
    }


  useEffect(() => {
    async function setUserName() {
        const currentUserObject = await JSON.parse(localStorage.getItem("chat-app-user"));
        setCurrentUser(currentUserObject)
    }

    setUserName();
  }, []); // Empty dependency array to run the effect only once

  return (
    <Container>
        
      <div className="button-container">
        <div className="emoji">
            <BsEmojiSmileFill onClick={handleEmojiPickerHideShow}/>
            {
                showEmojiPicker && 
                (
                <PickerContainer>
                    <EmojiPicker onEmojiClick = {handleEmojiClick} />
                </PickerContainer>
                )
            }
        </div>
        <div className="emoji">
            <button onClick = {handlePreview} style = {{backgroundColor: "#007bff",borderRadius: "50%", width: "2.2rem", // Set the width and height to make the button circular
    height: "2.2rem", color: "white",border: "none",
                padding: "0.4rem",fontSize: "1.7rem",cursor: "pointer"}}>?
            </button>
        </div>
        
      </div>

      
      
      <form className = "input-container" onSubmit ={(e)=>{sendChat(e);}}>
            <input type = "text" placeholder = "type your message here" value ={msg} onChange ={(e)=>{
                setMsg(e.target.value); 
                setProactive(false);
                setPreviewText("");
                setPreview(false);
                setCopy(false);
                }}/>
            <button className = "submit"  >
                <IoMdSend/>
            </button>
      </form>

      <div>
      {currentUser.username === "admin" ? (<button onClick = {generateRes} style={{ color: "white", fontSize: "50px", background: "transparent", border: "none", cursor: "pointer" }}>
  &#x27A1;
</button>):null}
    </div>
    

    {preview && (
            
     <OverflowTextContainer>
        
        
                <div className="overflow-text">

                    
                {previewText}
                    
                </div>
               
                {copy && 
                (
                

                <button class="copy-button" onClick = {handleCopy} style={{ background: "yellow", width: "40px", height: "50px", marginLeft: "auto",border: "none" }}>
                <span style={{ fontSize: '45px' }}>&#x2398;</span>
                </button> 
                
                
              
                )}

                <button class="close-button" onClick = {handleClose} style={{ background: "yellow", width: "40px", height: "50px", marginLeft: "auto",border: "none" }}>
                <span style={{ fontSize: '25px' }}>&#x2716;</span>
                </button> 

                
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                
        
    </div>
    
                
     </OverflowTextContainer>
      )}
      


    </Container>

    

    
  )
};




//. is used for class names
//. is not used when element type (such as div, img etc. are used)
const Container = styled.div`
display: grid;

grid-template-columns: 5% 95%;
align-items: center;
background-color: darkpurple;
padding: 0.2rem;
padding-bottom: 0.3rem;


margin-top: 1rem;
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
        max-height: 200px; /* Set a maximum height for vertical scrolling */
        overflow-y: auto; /* Enable vertical scrolling when content overflows */

        width: 95%;
        border-radius: 2rem;
        display: flex;
        gap: 2rem;
        background-color: #ffffff34;
        margin-left: auto;
        padding: 0.45rem;
        input{
            
            max-width: 80%;

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
  right: -350px;
  background-color: #080420;
  border: 1px solid #ccc;
  padding: 0.5rem;
  z-index: 1000;
`;

const OverflowTextContainer = styled.div`
    width: 94.2%;
    display: flex;
    height: 88%; /* Increase the height value */
    background-color: yellow;

    
    
    max-height: none; /* Remove the max-height restriction */
    padding: 0.6rem; /* Add padding for better visibility */
    color: black; /* Set text color */
    margin-top: 0.5rem; /* Adjust the margin-top value */
    margin-left: 3.2rem;
    border-radius: 2rem;
    
    .overflow-text {
        margin-top: 0.1rem;
        font-size: 20px;
        width: 85%;
        height: 3.7rem;
        overflow: auto;
        margin-left:1rem;
        /* Hide the scrollbar */
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
        width: 0; /* WebKit-based browsers (Chrome, Safari) */
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
    
`;
