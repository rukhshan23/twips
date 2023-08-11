import React, {useState, useEffect, useLayoutEffect, useRef} from 'react'
import styled from "styled-components";
import ChatInput from "../components/ChatInput";
import Messages from "../components/Messages";
import axios from "axios"
import _isEqual from 'lodash/isEqual';
import {sendMessageRoute, getAllMessagesRoute} from "../utils/APIRoutes"


export default function ChatContainer({currentChat, currentUser}) {
    const chatMessagesRef = useRef(null);
    const [messages,setMessages] = useState([]);
    const [messageSent, setMessageSent] = useState(1);

    useLayoutEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages]);

/*
    const fetchChat = async () => {
        try {
            const response = await axios.post(getAllMessagesRoute, {
                from: currentUser._id,
                to: currentChat._id,
            });

            if (!_isEqual(response.data, messages)) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Error fetching chat:', error);
        }
    };

    useEffect(() => {
        // Fetch initially
        fetchChat();

        // Fetch periodically
        const fetchInterval = setInterval(fetchChat, 1000); // 2 seconds interval

        return () => {
            clearInterval(fetchInterval); // Cleanup interval on component unmount
        };
    }, [currentChat]);
    */




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
        
        

        const handleSendMsg = async (msg) =>{
            await axios.post(sendMessageRoute,{
                from: currentUser._id,
                to: currentChat._id,
                message: msg,
            })
            setMessageSent(messageSent + 1)
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

        </div>
        <div className="chat-messages" ref={chatMessagesRef}>

            {
                messages.map ((message) => {
                    return (
                        <div>
                            <div className = {`message ${message.fromSelf ? "sended":"recieved"}`}>
                                <div className="content">
                                    <p>
                                        {message.message}
                                    </p>
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
    )};
    </>
  )
}

const Container = styled.div`
padding-top: 1rem;
display: grid;
grid-template-rows: 10% 78% 12%;
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
        }
    }
    .recieved{
        justify-content: flex-start;
        .content{
            background-color: red;
        }
    }
}



`;
