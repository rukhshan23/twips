import React, {useState, useEffect, useLayoutEffect, useRef} from 'react'
import styled from "styled-components";
import ChatInput from "../components/ChatInput";
import Messages from "../components/Messages";
import axios from "axios"
import _isEqual from 'lodash/isEqual';
import {sendMessageRoute, getAllMessagesRoute} from "../utils/APIRoutes"
import {LLMInterpretation,generateMeaning,identifyComplexSentences} from './LLMInterpretation.jsx'
import EraseChat from "../components/EraseChat"; 
import MessageWithSubstrings from './MessageWithSubstrings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';


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
    const [substringArray, setSubstringArray] = useState([])
    const [complexExplanation, setComplexExplanation]=useState("")
    


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
            //console.log("empty", message)
            setSelected(false)
            setSelectedID("")
            setDetail(false)
            setMeaning("")
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
                //console.log("Response.data", response.data, "messages", messages)
                setMessages(response.data);
                //console.log("messages set", messages)
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
       const handleShowDetail = async ({message}) =>{
        if(detail === true)
        {
            setDetail(false);
            setClickedMessageId("");
            //setMeaning("")
            return;
        }


        //let chat = await formatMessages(messages);
        //const prompt = chat + '\n\n Describe the meaning of the last message in a line by line fashion, given the conversation history. If there is any non-literal text (metaphors, jokes etc.) or use of emojis, explain it in full detail. If not, do not mention it.';
        
        setMeaning("Analyzing...");
 
        setDetail(true)
        let LLMMeaning = await LLMInterpretation({message:message.message, fromSelf:message.fromSelf, detail: true})
        //console.log(LLMMeaning)
            // setClickedMessageId("");
        

            
        setMeaning(LLMMeaning)
            // setSelectedID(message._id)
            // console.log("Message", message)
            // console.log("Selected text:", selectedText);
            // console.log("LLMMeaning:", LLMMeaning);
            // console.log("selectedID", selectedID);
       }
        
        const handleSendMsg = async (msg) =>{
            let complexSentencesArray = '';
            let complexSentences = await identifyComplexSentences({message:msg})
            //console.log("COMP Sentences:", complexSentences)
            const regex = /"([^"]*)"/g;
            const matches = complexSentences.match(regex);
            if (matches) {
            const arrayOfStrings = matches.map(match => match.replace(/"/g, ''));
           
            //setSubstringArray(arrayOfStrings)
            complexSentencesArray = arrayOfStrings;
            //console.log("COMP Sentences Array Local: ",arrayOfStrings); // This will output: ["string1", "string2", "string3"]
            //console.log("COMP Sentences Array State: ",substringArray); // This will output: ["string1", "string2", "string3"]
            } else {
            //console.log("No matches found.");
            }
        

            let fetchedFormattedChat = await fetchChatInterpretation();
            let interpretation=''
            if(fetchedFormattedChat[0])
            {
                interpretation = await LLMInterpretation({message:msg, fromSelf:false.fromSelf, detail:false}) 
            
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
                complexSentencesArray: complexSentencesArray,
            })
            setMessageSent(messageSent + 1)
    }

    const handleShowInterpretation = async (interpretation,messageId) => {
            if(clickedMessageId === messageId)
            {
                
                setClickedMessageId("");
                setDetail(false);
                setComplexExplanation("")
            }
            else if (selectedID==="")
            {
                //console.log("hey ID")
                setComplexExplanation("")
                setClickedMessageId(messageId);
                //console.log("Interpretation", interpretation, "ID", messageId)
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
                                    
                                    {message.fromSelf === true ? (<p style={{lineHeight: '1.4'}}>{message.message}</p>):( <MessageWithSubstrings fromSelf = {message.fromSelf} message={message.message} messageID = {message._id} substringArray={message.complexSentencesArray} 
                                    setComplexExplanation = {setComplexExplanation} complexExplanation = {complexExplanation} 
                                    setDetail = {setDetail} setClickedMessageId = {setClickedMessageId}/>)}

                                    
                                    
                                    
                                    {clickedMessageId === message._id && complexExplanation !== "" && ( <p onClick = {(e)=> {
                                        
                                        e.stopPropagation(); 
                                        //console.log("Here upon click", detail)
                                        /*setComplexExplanation("");
                                        setDetail(false);
                                    setClickedMessageId("");*/}} class="interpretation">{complexExplanation}</p>)}

                                        
                                 
                                    


                                    {clickedMessageId === message._id && detail === false && complexExplanation === ""? (
                                    <p onClick = {(e)=> {e.stopPropagation();}} class="interpretation" >{message.interpretation.replace("Intent", "\nIntent").split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                          {line}
                                          <br/>
                                        </React.Fragment>
                                        
                                       
                                      ))} <button style={{backgroundColor: 'transparent', fontSize:'38px', border: 'none'}}onClick= {(e)=>{e.stopPropagation();  handleShowDetail({message})}}>
                                    <FontAwesomeIcon icon={faSearch} style={{ color: "#000000" }} /> </button></p> 
                                    ): clickedMessageId === message._id && detail === true && complexExplanation === "" && (<p onClick = {(e)=> {e.stopPropagation();
                                        handleShowDetail({message})}} class="interpretation" >{meaning}</p>)}
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
            background-color: brown;
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
