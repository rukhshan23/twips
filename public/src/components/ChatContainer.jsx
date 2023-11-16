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
    const [showExplanation, setShowExplanation] = useState(false)
    


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
            let matches;
            //console.log("COMP Sentences:", complexSentences)
            const regex = /"([^"]*)"/g;
            if(complexSentences===undefined)
            {
                matches = false;
            }
            else
            {
                matches = complexSentences.match(regex); 
            }
    
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
                            
                            //onClick={ () => handleMouseUp({message: message})}
                            className = {`message ${message.fromSelf ? "sended":"recieved"}`}
                           
                            >
                                <div onClick={ () => handleMouseUp({message: message})} title={clickedMessageId !== message._id ? 'Click here for tone and meaning of this message!' : 'Click to close explanation!'} className="content">
                                    {console.log("message.complexSentencesArray[0]",message.complexSentencesArray[0],"COMP")}
                                    {message.complexSentencesArray[0] !=='' && message.fromSelf !== true &&
                                    //<p style ={{fontSize: "10px"}}> o </p>
                                    <div  style={{
                                        width: '25px',
                                        height: '25px',
                                        backgroundColor: 'grey',
                                        borderRadius: '50%',   // Makes it a circle
                                        position: 'relative',
                                        top: '-15.5px',           // Adjust the top position (moves down)
                                        right: '15.5px',          // Adjust the left position (moves right)
                                        //transform: 'translate(50%, -50%)', // Center the dot vertically and horizontally
                                        
                                        
                                      }} title = "Indicates certain parts of this message are underlined!"> O</div>
                                    /*<button onClick={(e) => {
                                        //alert(message.complexSentencesArray[0]);
                                        setShowExplanation(!showExplanation)
                                        e.stopPropagation();
                                      }}>Ambigous!!</button>*/
                                    }

                                    {
                                    //<p style={{lineHeight: '1.4'}}>{message.message}</p>

                                    message.fromSelf === true ? (<p style={{lineHeight: '1.4'}}>{message.message}</p>):( <MessageWithSubstrings fromSelf = {message.fromSelf} message={message.message} messageID = {message._id} substringArray={message.complexSentencesArray} 
                                    setComplexExplanation = {setComplexExplanation} complexExplanation = {complexExplanation} 
                                    setDetail = {setDetail} setClickedMessageId = {setClickedMessageId}/>)}
                                    
                                    {
                                        /*showExplanation === true &&
                                        <p class="interpretation">
                                        
                                        <strong>Hey Frank!</strong> <br/> is a friendly and informal greeting typically used when addressing someone named Frank. It's a way to get someone's attention or initiate a conversation in a casual and personable manner. <br/> <br/> 

                                        <strong>Hold your horses:</strong> <br/> an idiomatic expression in English that means to be patient, wait a moment, or slow down. It is often used to ask someone to pause or not to rush into a decision or action. <br/> <br/> 
                                        
                                        <strong>Flying with running colors:</strong><br/> an idiomatic phrase in English that means to succeed or perform exceptionally well in a particular endeavor, often with great ease and without encountering significant obstacles or difficulties.
                                        </p> */
                                    }
                                    

                                    
                                    
                                    
                                    {clickedMessageId === message._id && complexExplanation !== "" && ( <p onClick = {(e)=> {
                                        
                                        //e.stopPropagation(); 
                                        //console.log("Here upon click", detail)
                                        /*setComplexExplanation("");
                                        setDetail(false);
                                    setClickedMessageId("");*/}} class="interpretation">{complexExplanation}</p>)}

                                        
                                 
                                    


                                    {clickedMessageId === message._id && detail === false && complexExplanation === ""? (
                                    <p onClick = {(e)=> {/*e.stopPropagation();*/}} class="interpretation" >{message.interpretation.replace("Meaning", "\nMeaning").split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                          {line}
                                          <br/>
                                          <br/>
                                        </React.Fragment>
                                        
                                       
                                      ))} 
                                      
                                      
                                      {/* <button style = {{textAlign: 'center',marginTop: "5px",marginLeft: "0rem",backgroundColor: "darkgreen",borderRadius: "10%", width: "4.5rem", // Set the width and height to make the button circular
                                      height: "2.6rem", color: "white",border: "none",padding: "0.1rem",fontSize: "1rem",cursor: "pointer"}}
                                      title={message.fromSelf ? 'Click to preview your message!' : 'Click to interpret the whole message!'} onClick= {(e)=>{e.stopPropagation();  handleShowDetail({message})}}>
                                    {!message.fromSelf ? 'Interpret Button' : 'Preview Button'} </button> */}
                                    
                                    </p>
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
            background-color: #666;

            padding: 1rem; /* Add padding for better interaction area */
            border-radius: 1rem;
            color: #fff;
            font-size: 1.5rem;
            
            /* Hover effect */
            transition: background-color 0.2s, transform 0.2s;
        } 
        .content:hover {
            background-color: #666;
            transform: scale(1.05); /* Slight scale-up on hover */
        }
        .interpretation{
            background-color: lightgrey;
            color: black;
            padding: 0.5rem;
            border-radius: 0.5rem;
            margin-top: 15px;
            

        }

    }
    .recieved{
        justify-content: flex-start;
        .content{
            background-color:#F5F5F5;
            padding: 1rem; /* Add padding for better interaction area */
            border-radius: 1rem;
            color: #333;
            font-size: 1.5rem;
            
            /* Hover effect */
            transition: background-color 0.2s, transform 0.2s;
        }
        .content:hover {
            background-color: #FAFAFA;
            transform: scale(1.05); /* Slight scale-up on hover */
          
            .under {
              text-decoration: underline;
              text-underline-offset: 6px;
            }
          }
          
        
        
        
        
        .interpretation{
            background-color: lightgrey;
            color: black;
            padding: 0.5rem;
            border-radius: 0.5rem;
            margin-top: 15px;
            

        }
    }
}



`;
