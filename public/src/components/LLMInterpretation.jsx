import React, {useState, useEffect} from 'react'
import axios from "axios"
import {getAllMessagesRoute} from "../utils/APIRoutes"

const fetchChat = async () => {
  try {
      let currentUser = (await JSON.parse(localStorage.getItem("chat-app-user")))
      let currentChat = await JSON.parse(localStorage.getItem("chat"))

      const response = await axios.post(getAllMessagesRoute, {
          from: currentUser._id,
          to: currentChat._id,
      });

      
      
      //const formattedChat = formatMessages(messages);
      console.log("R data:", response.data);
      return response.data;

  } catch (error) {
      console.error('Error fetching chat:', error);
  }
};

function formatMessages(messages) {
       
  const formattedMessages = messages.map(message => {
      
      if (message.fromSelf) {
          return `Me: ${message.message}`;
      } else {
          return `Other: ${message.message}`;
      }
  });

  return formattedMessages.join('\n');
}


function formatOutput(alternateMessage, toneIntent)
{

  let altMsg = ""
  const regex = /"([^"]+)"/; // Regular expression to match text within double quotes
  const match = alternateMessage.match(regex);

  if (match && match[1]) 
  {
    altMsg = 'Instead, you might want to say: "'+match[1]+'"'; // Return the matched text without the double quotes
  }
  else
  {
    altMsg=""
  }
  return [toneIntent + "\n" + altMsg,altMsg.length]; // Return an empty string if no match found
}



async function LLMPreview(promptProp, maxTokens = 50) {
  try {
    console.log("prompt",promptProp)
      const prompt = promptProp;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer REMOVED' // Replace with your ChatGPT API key
          },
          body: JSON.stringify({
              'model': 'gpt-3.5-turbo',
              'messages': [
                  {
                      'role': 'system',
                      'content': prompt
                  }
              ],
              //'max_tokens': maxTokens
              'temperature': 0.8,
              'presence_penalty': 0.8,
              
          })
      });

      const data = await response.json();
      const dataResponse = data.choices[0].message.content;
      console.log("LLM Interpretation successful 122!")
      console.log("DR",dataResponse)
      return dataResponse;
  } catch (error) {
    console.log("Error: ", error)
      return error;
  }


}

async function LLMPreviewPipeLine({formattedChat, message})
{
  //initial check prompt
  const initialPrompt = formattedChat + '\n\nState if the tone/intent of the last message is offensive, rude, abusive, disrespectful or bullyish in this format: "Y" for yes and "N" for no.';
  const yPrompt =   formattedChat + '\n\nCome up with an alternative message that is more positive/appropriate. Encapsulate it in double quotes.';
  //const cPrompt = formattedChat + '\n\nDescribe the tone and intent conveyed by the text and any emojis in the last message in this conversation.'
  const cPrompt = formattedChat + '\n\nIn the context of the conversation above, describe how will the other user feel upon receiving this message from me next: ' + message + "\n\n In your explanation, focus on the tone/intent/meaning conveyed by my words and emojis (if I have used any emojis)."

  let alternateMessage = ""
  let toneIntent = ""

  
  let checkVal = await LLMPreview(initialPrompt)
  console.log("checkVal val", checkVal)
  if(checkVal.toUpperCase().includes("Y"))
  {
    alternateMessage = await LLMPreview(yPrompt)
    toneIntent =await LLMPreview (cPrompt)
  }
  else
  {
    alternateMessage = ""
    toneIntent =await LLMPreview (cPrompt)
  }

  return formatOutput(alternateMessage, toneIntent)
}



async function LLMProactivePipeLine({formattedChat,message})
{
  //initial check prompt
  const initialPrompt = formattedChat + '\n\nState if the tone/intent of the last message is rude or abusive or bullyish in this format: "Y" for yes and "N" for no.';
  const yPrompt =   formattedChat + '\n\nCome up with an alternative message that is more positive/appropriate. Encapsulate it in double quotes.';
  //const cPrompt = formattedChat + '\n\nDescribe the tone and intent conveyed by the text and any emojis in the last message in this conversation.'
  const cPrompt = formattedChat + '\n\nIn the context of the conversation above, describe how will the other user feel upon receiving this message from me next: ' + message + "\n\n In your explanation, focus on the tone/intent/meaning conveyed by my words and emojis (if I have used any emojis)."

  let alternateMessage = ""
  let toneIntent = ""

  console.log("initialPrompt val", initialPrompt)
  if(await LLMPreview(initialPrompt) === 'Y')
  {
    alternateMessage = await LLMPreview(yPrompt)
    toneIntent =await LLMPreview (cPrompt)
    return formatOutput(alternateMessage, toneIntent)
  }
  else
  {
    //alternateMessage = ""
    //toneIntent =await LLMPreview (cPrompt)
    return ["",""]
  }


}

async function LLMInterpretation({message,fromSelf}) {

  let currentConversation = await fetchChat();
  let textConversation = formatMessages(currentConversation);
  const initialPrompt = textConversation + '\n\n In the context of the conversation above, explain what the following message ' + (fromSelf ? " sent by me is conveying to the other user":"sent by the other user is conveying to me") + " in a line by line fashion:" +message
  let replyGPT = await LLMPreview(initialPrompt);
  return replyGPT;

}


async function generateResponse({formattedChat})
{
  //initial check prompt
  
  const initialPrompt = formattedChat + '\n\n Imagine you are Generate a natural reply. Act as if you are the other party. Act rudely. Take into account the previous conversation.';
  let replyGPT = await LLMPreview(initialPrompt);
  return replyGPT;

}

async function generateMeaning({formattedChat, phrase})
{
  //initial check prompt
  let maxWords = 20;
  const initialPrompt = formattedChat + '\n\n In a max of ' + maxWords +' words, explain the meaning of the following in the conversation above: ' + phrase + 'Follow this format Meaning: "xyx"';
  let replyGPT = await LLMPreview(initialPrompt, 30);
  return replyGPT;

}

async function identifyComplexSentences({message})
{

  let currentConversation = await fetchChat();
  let textConversation = formatMessages(currentConversation);
  const initialPrompt = textConversation + '\n\nIn the context of the conversation above, identify any phrases/emojis in the following message that have an unclear meaning and difficult to understand (for example, it could be sarcasm, a joke, metaphor, idiom or an emoji with a situated meaning): ' +  message + '\n\nYou MUST copy AS IS and format your output in DOUBLE QUOTES like this: \"phrase/emoji one\" \"phrase/emoji two\"'
  let replyGPT = await LLMPreview(initialPrompt);
  return replyGPT;

}

async function explainComplexSentences({message, fromSelf})
{
  let currentConversation = await fetchChat();
  let textConversation = formatMessages(currentConversation);
  const initialPrompt = textConversation + 'In the context of the conversation above, the following ' + (fromSelf ? " message segment I sent to the other user" : "message segment the other user sent to me: ") + 'is difficult to understand due to its ambigous meaning: '+ message +'"\nExplain to me in simple language what ' + (fromSelf ? "I am conveying to the other user" : "is the other user is trying to convey to me") + ' in the context of the conversation above.'
  let replyGPT = await LLMPreview(initialPrompt);
  return replyGPT;
}




export {LLMInterpretation,LLMPreviewPipeLine,LLMProactivePipeLine,generateResponse,generateMeaning,identifyComplexSentences, explainComplexSentences}