import React, {useState, useEffect} from 'react'
import axios from "axios"
import {getAllMessagesRoute} from "../utils/APIRoutes"
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";



const fetchChat = async () => {
  try {
      let currentUser = (await JSON.parse(localStorage.getItem("chat-app-user")))
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

function formatMessages(messages) {
       
  const formattedMessages = messages.map(message => {
      
      if (message.fromSelf) {
          return `Jeff: ${message.message}`;
      } else {
          return `Frank: ${message.message}`;
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

async function LLMPreview (promptProp, maxTokens = 50)
{
  
  const endpoint = "https://labapi.openai.azure.com/";
  const azureApiKey = "d330d875e19340488a15a0a6007c0498"

  const messages = [
    { role: "user", content: promptProp },
  ];
  
  try
  {
    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    const deploymentId = "LABGPT";
    const result = await client.getChatCompletions(deploymentId, messages);
    const dataResponse = result.choices[0].message.content;
    //console.log("dataResponse",dataResponse)
    return dataResponse;

  
  }
  catch(err)
  {
    console.error("The sample encountered an error:", err);
    return err;

  }
  

}

/*
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
*/

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
  //console.log("checkVal val", checkVal)
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

  //console.log("initialPrompt val", initialPrompt)
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

async function LLMInterpretation({message,fromSelf,detail}) {
  let currentConversation = await fetchChat();
  let textConversation = formatMessages(currentConversation);
  let initialPrompt = ""
  
  if(detail)
  {
    // initialPrompt = textConversation + '\n\nHey ChatGPT - I am Jeff. Above is a conversation I am having with Frank. In the context of the above conversation, explain to me what the following message, which was ' + (fromSelf ? "sent by me, is conveying to Frank":"sent by Frank, is conveying to me") + " in detail (40 words maximum):\n\n" +message+'\n\nFocus on tone and intent of text/emojis used in the message.'
    if (fromSelf)
    {
      initialPrompt = textConversation + '\n\nHey ChatGPT - I am Jeff. Above, you will find my conversation with Frank. In the context of the conversation above, explain in detail (50 words maximum) how would Frank potentially feel upon reading this message:\n\n' + message +'\n\nFocus on the tone and intent of text/emojis used in the message.'
    }
    else
    {
      initialPrompt = textConversation + '\n\nHey ChatGPT - I am Jeff. Above, you will find my conversation with Frank. In the context of the conversation above, explain in detail (50 words maximum) what Frank is potentially implying by this message:\n\n' + message +'\n\nFocus on the tone and intent of text/emojis used in the message.'
    }
  }
  else
  {
    //initialPrompt = textConversation + '\n\nDescribe the tone and intent conveyed by the text and any emojis in the last message in this conversation in this format: "Tone: xyz. Intent: abc. " ';
   

    // initialPrompt = textConversation + '\n\nIn the conversation above, describe the tone and intent of the text/emojis in the next message in the conversation sent by' + (fromSelf? " me to the other user":"the other use to me") + 'in this conversation.\n\n'+ message + '\n\nFormat your output exactly as: "Tone: xyz. Intent: abc. " ';
    console.log("Hey, this is the message", message)
    initialPrompt = textConversation + '\n\nIn the conversation above, briefly describe the tone and intent (5 words each max) of the following message: \n\n'+ message + '\n\nFormat your output EXACTLY as: "Tone: xyz. Intent: abc. " ';

  }
  //console.log("Prompt:\n\n",initialPrompt)
  console.log("LLMInterpretation PROMPT:"+ (detail? "DETAIL":"") +"\n\n", initialPrompt)
  let replyGPT = await LLMPreview(initialPrompt);
  console.log("LLMInterpretation RESPONSE" + (detail? "DETAIL":"") +"\n\n", replyGPT)
  return replyGPT;

}


async function identifyComplexSentences({message})
{

  let currentConversation = await fetchChat();
  let textConversation = formatMessages(currentConversation);
  const initialPrompt = textConversation + '\n\nIn conversation above, the following message was sent:\n\n' + message +
  '\n\nIn this specific message, identify any phrases/emojis that may have an ambigous meaning (such as idioms, sarcasm, jokes and irony ' + 
  'or emojis with a situated meaning). You MUST copy AS IS from the message provided, and format your output in DOUBLE QUOTES like this: "phrase/emoji one" "phrase/emoji two"'
  console.log("identifyComplexSentences PROMPT", initialPrompt)
  let replyGPT = await LLMPreview(initialPrompt);
  console.log("identifyComplexSentences RESPONSE", replyGPT)
  return replyGPT;

}

async function explainComplexSentences({message, fromSelf,messageText})
{
  let currentConversation = await fetchChat();
  let textConversation = formatMessages(currentConversation);
  let initialPrompt = "";
  console.log('ABC', message)
  if(fromSelf)
  {
    initialPrompt = textConversation + '\n\nIn the conversation above, I sent the following to the other use ' + message +' in the message: '+ messageText +
    '\n\nExplain to me in simple language what would the receiver potentially think I am implying upon reading' + message + ' in the aforementioned context. Focus on the tone and intent of the message.'
  }
  else
  {
    initialPrompt = textConversation + '\n\nIn the conversation above, the following was sent by the other user to me ' + message +' in this message:'+ messageText +
    '\n\nExplain to me in simple language what is the sender potentially implying from' + message + ' in the aforementioned context. Focus on the tone and intent of the message.'
  }
  console.log("explainComplexSentences PROMPT", initialPrompt)
  let replyGPT = await LLMPreview(initialPrompt);
  console.log("explainComplexSentences RESPONSE", replyGPT)
  return replyGPT;
}


async function generateResponse({formattedChat})
{
  //initial check prompt
  //admin panel  
  const initialPrompt = formattedChat + '\n\n Imagine you are Generate a natural reply. Act as if you are the other party. Act rudely. Take into account the previous conversation.';
  let replyGPT = await LLMPreview(initialPrompt);
  return replyGPT;

}

async function generateMeaning({formattedChat, phrase})
{
  //initial check prompt
  //selection functionality
  let maxWords = 20;
  const initialPrompt = formattedChat + '\n\n In a max of ' + maxWords +' words, explain the meaning of the following in the conversation above: ' + phrase + 'Follow this format Meaning: "xyx"';
  let replyGPT = await LLMPreview(initialPrompt, 30);
  return replyGPT;

}




export {LLMInterpretation,LLMPreviewPipeLine,LLMProactivePipeLine,generateResponse,generateMeaning,identifyComplexSentences, explainComplexSentences}