import React from 'react'
import axios from "axios"
import {deleteChatRoute} from "../utils/APIRoutes"
export default function EraseChat() {
    
    async function deleteChatClick() {
        // Your logic here

        try {
            let currentUser = await JSON.parse(localStorage.getItem("chat-app-user"))
            let currentChat = await JSON.parse(localStorage.getItem("chat"))

            const response = await axios.post(deleteChatRoute, {
                from: currentUser._id,
                to: currentChat._id,
            });

            
            
            //const formattedChat = formatMessages(messages);
            console.log("deleted:" , response.data.msg);
            //return response.data;

        } catch (error) {
            console.error('Error in deletion:', error);
        }
      }
      



  return (
    <div>
        <button onClick={deleteChatClick} class="text-button" style={{marginRight: "auto", fontSize:"24px", background: "transparent", color: "white", border: "none" }}>
        &#128465;</button>
    </div>
  )
}
