import React, {useState, useEffect, useLayoutEffect, useRef} from 'react'
import styled from "styled-components";
import ChatInput from "../components/ChatInput";
import Messages from "../components/Messages";
import axios from "axios"
import _isEqual from 'lodash/isEqual';
import {sendMessageRoute, getAllMessagesRoute} from "../utils/APIRoutes"
import {LLMInterpretation} from './LLMInterpretation.jsx'
import EraseChat from "../components/EraseChat"; 


export default function ChatContainer({currentChat, currentUser}) {
    const chatMessagesRef = useRef(null);
    const [messages,setMessages] = useState([]);
    const [messageSent, setMessageSent] = useState(1);
    const [clickedMessageId, setClickedMessageId] = useState(null);

    useLayoutEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages]);

    function formatMessages(messages) {
        const formattedMessages = messages.map(message => {
            if (message.fromSelf) {
                return `Me: ${message.message}`;
            } else {
                return `Other person: ${message.message}`;
            }
        });
    
        return formattedMessages.join('\n');
    }


    const fetchChat = async () => {
        try {
            const response = await axios.post(getAllMessagesRoute, {
                from: currentUser._id,
                to: currentChat._id,
            });
            
            //const formattedChat = formatMessages(messages);
            //console.log(formattedChat);

            if (!_isEqual(response.data, messages)) {
                console.log("Response.data", response.data, "messages", messages)
                setMessages(response.data);
                console.log("messages set", messages)
            }
        } catch (error) {
            console.error('Error fetching chat:', error);
        }
    };

    const fetchChatInterpretation = async () => {
        try {
            const response = await axios.post(getAllMessagesRoute, {
                from: currentUser._id,
                to: currentChat._id,
            });
            
            return [true,formatMessages(messages)];
            
        } catch (error) {
            console.error('Error fetching chat:', error);
            return [false,error];
        }
    };

    useEffect(() => {

        
        // Fetch initially
        fetchChat();

        // Fetch periodically
        const fetchInterval = setInterval(fetchChat, 1000); 

        return () => {
            clearInterval(fetchInterval); // Cleanup interval on component unmount
        };
    },);
    


/*

    useEffect(()=>{
            const fetchChat = async () => {

                console.log("In fetchChat")

                const response = await axios.post(getAllMessagesRoute, {
                    from:currentUser._id,
                    to: currentChat._id,
                });

                console.log("response is here", response)
                
                setMessages(response.data)
               
                

            }
        
            fetchChat();
           
            
        },[currentChat]);
        
        */
        
        const handleSendMsg = async (msg) =>{
            let fetchedFormattedChat = await fetchChatInterpretation();
            let interpretation=''
            if(fetchedFormattedChat[0])
            {
                
                let allChat = fetchedFormattedChat[1] + "\nMy Latest Message: "+ msg
                //send the chat to GPT
                console.log("asdasds", allChat)
                interpretation = await LLMInterpretation({formattedChat: allChat})
               
                console.log("Interpretation is here: ", interpretation)
            }
            else
            {
                console.log("Error in fetching formatted: ",fetchedFormattedChat[0])
            }
            
            
            

            await axios.post(sendMessageRoute,{
                from: currentUser._id,
                to: currentChat._id,
                message: msg,
                interpretation:interpretation,
            })
            setMessageSent(messageSent + 1)
    }

    const handleShowInterpretation = async (interpretation,messageId) => {
            if(clickedMessageId === messageId)
            {
                setClickedMessageId("");
            }
            else
            {
                setClickedMessageId(messageId);
                console.log("Interpretation", interpretation, "ID", messageId)
            }
        
    }

    return (
    <>
    { currentChat && (
    <Container>

        <div className = "chat-header">
            <div className="user-details">
                <div className="avatar">
                    <img
                        src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                        alt="avatar"
                    />
                </div>
                    <div className="username">
                        <h3>{currentChat.username}</h3>
                        
                </div>
                
            </div>
           
            <div >
            
            <EraseChat/>
                
            </div>
               
        </div>
        
        <div className="chat-messages" ref={chatMessagesRef}>

            {
                messages.map ((message) => {
                    return (
                        <div>
                            <div className = {`message ${message.fromSelf ? "sended":"recieved"}`}
                            onClick={() => handleShowInterpretation(message.interpretation,message._id)}
                            >
                                <div className="content">
                                    <p>
                                        {message.message}
                                    </p>
                                    {clickedMessageId === message._id && (
                                    <p class="interpretation" >{message.interpretation.replace("Intent", "\nIntent").split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                          {line}
                                          <br/>
                                        </React.Fragment>
                                      ))}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }
            )
                
            }
        </div>
        <ChatInput handleSendMsg={handleSendMsg} />
        </Container>
    )}
    </>
  )
}

const Container = styled.div`
padding-top: 1rem;
display: grid;
grid-template-rows: 10% 70% 20%;
gap: 0.1rem;
overflow: hidden;
position: relative;
height:100%;
.chat-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    .user-details{
        display:flex;
        align-items: center;
        gap: 1rem;
        .avatar{
            img{
                height:3rem;
            }
        }
        .username{
            h3{
                color: white;
            }
        }
    }
}

.chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    overflow: auto;
    .message{
        display: flex;
        align-items: center;
        
        
    .content{
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: white;
    }
    }
    .sended{
        justify-content: flex-end;
        .content{
            background-color: green;

            padding: 1rem; /* Add padding for better interaction area */
            border-radius: 1rem;
            color: white;
            
            /* Hover effect */
            transition: background-color 0.2s, transform 0.2s;
        }
        &:hover .content {
            background-color: darkgreen;
            transform: scale(1.05); /* Slight scale-up on hover */
        }
        .interpretation{
            background-color: yellow;
            color: black;
            padding: 0.5rem;
            border-radius: 0.5rem;
            margin-top: 15px;
            

        }

    }
    .recieved{
        justify-content: flex-start;
        .content{
            background-color: red;
            padding: 1rem; /* Add padding for better interaction area */
            border-radius: 1rem;
            color: white;
            
            /* Hover effect */
            transition: background-color 0.2s, transform 0.2s;
        }
        &:hover .content {
            background-color: darkred;
            transform: scale(1.05); /* Slight scale-up on hover */
        }
        .interpretation{
            background-color: yellow;
            color: black;
            padding: 0.5rem;
            border-radius: 0.5rem;
            margin-top: 15px;
            

        }
    }
}



`;
