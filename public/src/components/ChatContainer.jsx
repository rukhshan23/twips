import React, {useState, useEffect, useLayoutEffect, useRef} from 'react'
import styled from "styled-components";
import ChatInput from "../components/ChatInput";
import Messages from "../components/Messages";
import axios from "axios"
import _isEqual from 'lodash/isEqual';
import {sendMessageRoute, getAllMessagesRoute} from "../utils/APIRoutes"
import {LLMInterpretation,generateMeaning,identifyComplexSentences} from './LLMInterpretation.jsx'
import EraseChat from "../components/EraseChat"; 


export default function ChatContainer({currentChat, currentUser}) {
    const chatMessagesRef = useRef(null);
    const [messages,setMessages] = useState([]);
    const [messageSent, setMessageSent] = useState(1);
    const [clickedMessageId, setClickedMessageId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selected, setSelected] = useState(false);
    const [selectedID, setSelectedID] = useState("");
    const [meaning, setMeaning] = useState("")
    const [detail, setDetail] = useState(false)

    const handleMouseDown = () => {
        setIsDragging(true);
      };

      const handleMouseUp = async ({message}) => {
        if (true/*isDragging*/) {
          const selectedText = window.getSelection().toString();
          if (selectedText) {
            
            // let chat = await formatMessages(messages);
  
            // let LLMMeaning = await generateMeaning({formattedChat:chat, phrase:selectedText})
            // setClickedMessageId("");
            // setSelected(true)

            
            // setMeaning(LLMMeaning)
            // setSelectedID(message._id)
            // console.log("Message", message)
            // console.log("Selected text:", selectedText);
            // console.log("LLMMeaning:", LLMMeaning);
            // console.log("selectedID", selectedID);
          }
          else{
            console.log("empty", message)
            setSelected(false)
            setSelectedID("")
            handleShowInterpretation(message.interpretation,message._id)
          }
        }
        setIsDragging(false);
      };


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
       const handleShowDetail = async () =>{
        if(detail === true)
        {
            setDetail(false);
            setClickedMessageId("");
            return;
        }


        let chat = await formatMessages(messages);
        const prompt = chat + '\n\n Describe the meaning of the last message in a line by line fashion, given the conversation history. If there is any non-literal text (metaphors, jokes etc.) or use of emojis, explain it in full detail. If not, do not mention it.';
        let LLMMeaning = await LLMInterpretation({formattedChat:chat, prompt:prompt})
        console.log(LLMMeaning)
            // setClickedMessageId("");
        setDetail(true)

            
        setMeaning(LLMMeaning)
            // setSelectedID(message._id)
            // console.log("Message", message)
            // console.log("Selected text:", selectedText);
            // console.log("LLMMeaning:", LLMMeaning);
            // console.log("selectedID", selectedID);
       }
        
        const handleSendMsg = async (msg) =>{
            let complexSentences = await identifyComplexSentences({message:msg})
            console.log("COMP Sentences:", complexSentences)
            let fetchedFormattedChat = await fetchChatInterpretation();
            let interpretation=''
            if(fetchedFormattedChat[0])
            {
                
                let allChat = fetchedFormattedChat[1] + "\nMy Latest Message: "+ msg
                //send the chat to GPT
                console.log("asdasds", allChat)
                const prompt = allChat + '\n\nDescribe the tone and intent conveyed by the text and any emojis in the last message in this conversation in this format: "Tone: xyz. Intent: abc. " ';
                interpretation = await LLMInterpretation({formattedChat: allChat, prompt: prompt})
               
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
                setDetail(false);
            }
            else if (selectedID==="")
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
                            <div 
                            //onMouseDown={handleMouseDown}
                            //onMouseUp={ () => handleMouseUp({message: message})}
                            onClick={ () => handleMouseUp({message: message})}
                            className = {`message ${message.fromSelf ? "sended":"recieved"}`}
                           
                            >
                                <div className="content">
                                    <p>
                                        {message.message}
                                        
                                    </p>
                                    {clickedMessageId === message._id && detail === false ? (
                                    <p onClick = {(e)=> {e.stopPropagation();}} class="interpretation" >{message.interpretation.replace("Intent", "\nIntent").split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                          {line}
                                          <br/>
                                        </React.Fragment>
                                        
                                       
                                      ))} <button onClick= {(e)=>{e.stopPropagation(); handleShowDetail()}}>Details?</button></p> 
                                    ): clickedMessageId === message._id && detail === true && (<p onClick = {(e)=> {e.stopPropagation();
                                        handleShowDetail()}} class="interpretation" >{meaning}</p>)}
                                    {selectedID === message._id && (
                                    <p class="interpretation" >{meaning}</p>
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
            font-size: 1.3rem;
            
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
            font-size: 1.3rem;
            
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
