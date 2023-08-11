import React, {useState, useEffect} from 'react'
import styled from "styled-components";
import axios from "axios";
import {useNavigate} from 'react-router-dom'
import { allUsersRoute } from "../utils/APIRoutes";
import Contacts from "../components/Contacts"; 
import ChatContainer from "../components/ChatContainer";


function Chat() {
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined)
  const navigate = useNavigate();
  const [currentChat, setCurrentChat] = useState(undefined)
  const [isLoaded,setIsLoaded] = useState(false);
  useEffect(() => {

    const fetchUser = async () => {
      if(!localStorage.getItem("chat-app-user"))
      {
        navigate("/login")
      }
      else
      {
        setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")))
        setIsLoaded(true);
      }

    }
    fetchUser();
  },[])


  useEffect(()=>{
    const checkAvatar = async () => {
      if(currentUser)
      {
        if(currentUser.isAvatarImageSet){
          const data= await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(data.data);
        }
        else
        {
          navigate("/setAvatar")
        }
     }
    }

    checkAvatar();



  },[currentUser])  

  const handleChatChange = (chat) => {
    console.log("in handleChatChange (Chat.jsx)")
    setCurrentChat(chat);
    console.log("chat", chat)
    

  }



  return ( 
    <Container>
      <div className="container"> 
        <Contacts contacts ={contacts} currentUser={currentUser} changeChat = {handleChatChange}/>
        {
          isLoaded && currentChat ? (
            console.log("Both defined", currentChat),

            <ChatContainer currentChat={currentChat} currentUser={currentUser} />
          ) : (
            console.log(currentChat, isLoaded),
            <div style={{ color: "white" }}></div>
          )}
      </div>
    </Container>
  );
}

const Container = styled.div`
height: 100vh;
width: 100vw;
display: flex;
flex-direction: column;
justify-content: center;
gap: 1rem;
align-items: center;
background-color: #131324;
.container {
  height: 85vh;
  width: 85vw;
  background-color: #00000076;
  display: grid;
  grid-template-columns: 35% 65%;
  @media screen and (min-width: 720px) and (max-width: 1080px)
  grid-template-columns: 35% 65%;
}

ChatContainer{

}

}
`

export default Chat
