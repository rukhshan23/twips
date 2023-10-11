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
          return `Me: ${message.message}`;
      } else {
          return `Other user: ${message.message}`;
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
    altMsg = 'Instead, you might want to say: \n"'+match[1]+'"'; // Return the matched text without the double quotes
  }
  else
  {
    altMsg=""
  }
  return [toneIntent + "\n" + altMsg,altMsg.length]; // Return an empty string if no match found
}


function formatOutputNew(gptOutput,negFlag)
{

  let altMsg = ""
  const regex = /"([^"]+)"/; // Regular expression to match text within double quotes
  const match = gptOutput.match(regex);
  if (match && match[1] && negFlag) 
  {
    altMsg = match[1]; // Return the matched text without the double quotes
  }
  return [gptOutput,altMsg.length]; // Return an empty string if no match found
}

async function LLMPreview (promptProp, maxTokens = 50, messagesCustom = false)
{
  
  const endpoint = "REMOVED";
  const azureApiKey = "REMOVED"
  let messages =""
  if(messagesCustom===false){
    messages = [
      { role: "user", content: promptProp },
    ];
  }
  else
  {
    messages = messagesCustom
  }
  
  try
  {
    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    const deploymentId = "GPT4";
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
  const initialPrompt = formattedChat + '\n\nState if the tone/intent of the last message is blunt,inappropriate,indifferent, offensive, rude, abusive, disrespectful or bullyish.';
  
  const userInitialPrompt1 = "Other user: Well, I was thinking, how about a trip to Gloucester, Massachusetts this weekend?" + "\n\nState if the tone/intent of the last message is blunt, inappropriate, indifferent, offensive, rude, abusive, disrespectful or bullyish. If multiple categories fit, rank the categories in descending order of accuracy/closeness."
  const  assistantInitialPrompt1 = "Blunt:No\nInappropriate:No\nIndifferent:No\nOffensive:No\nRude:No\nAbusive:No\nDisrespectful:No\nBullyish:No"

  const userInitialPrompt2= "Other user: I am not going with you. fuck you." + "\n\nState if the tone/intent of the last message is blunt, inappropriate, indifferent, offensive, rude, abusive, disrespectful or bullyish. If multiple categories fit, rank the categories in descending order of accuracy/closeness."
  const  assistantInitialPrompt2 = "Rude: Yes\nInappropriate: Yes\nOffensive: Yes\nDisrespectful: Yes\nBlunt: Yes\nIndifferent: No\nAbusive: No\nBullyish: No"

  const messagesInitialPrompt = [
    { role: "user", content: userInitialPrompt1},
    { role: "assistant", content: assistantInitialPrompt1},
    { role: "user", content: userInitialPrompt2},
    { role: "assistant", content: assistantInitialPrompt2},
    { role: "user", content: initialPrompt}
  ];

  
 
  
  let checkVal = await LLMPreview(initialPrompt, undefined, messagesInitialPrompt)
  const lines = checkVal.split('\n')
  let negFlag=false

  let yesCategories=[]

  for (const line of lines) {
  if (line.toUpperCase().includes('YES')) {
    negFlag=true
    const categoryName = line.split(':')[0];
    yesCategories.push(categoryName);
    }
  }



  let othersUserName = JSON.parse(localStorage.getItem("chat"))['username']
  let myUserName = JSON.parse(localStorage.getItem("chat-app-user"))['username']

  const ycPrompt =  "My name is "+myUserName+". Here is my conversation with a friend:" + formattedChat + '\n\nMy last message in the conversation above sounds' + yesCategories[0] +". In 20 words or less, describe and explain to me how, "+othersUserName+", the other user, may interpret and feel upon reading my last message. Focus on my message's tone and meaning. Also, come up with an alternate message for me that is appropriate and does not sound " +yesCategories[0] +'. Try to preserve the meaning of my original message if possible. Match my writing style from the conversation. Encapsulate the alternate message in double quotes.';

  const ycSamplePrompt = "My name is "+myUserName+". Here is my conversation with a friend: \n\n Jack: hey! how are you doing?\nJimmy (me): hey! i'm good, thanks. what's going on?\nJack : do you want to join me on a trip to gloucester?\nJimmy (me): gloucester, huh? sounds like a blast! what's the plan, mate?\nJack's last message: it is going to be a little expensive. would you be able to afford it?\n\nMy last message in the conversation above sounds blunt. In 20 words or less, describe and explain to me how Jack,the other user, may interpret and feel upon reading my message. Focus on my message's tone and meaning. Also, come up with an alternate message for me that is appropriate and does not sound blunt. Match my writing style from the conversation. Try to preserve the meaning of my original message if possible. Encapsulate the alternative message in double quotes.";

  const ycSampleContent = 'Admin might feel uncomfortable, put on the spot, or even taken aback by your direct inquiry into their financial capacity. Instead, you could say "Keep in mind, it might be a bit on the pricier side. Does that fit into your budget at the moment?"'


   

  const cPrompt = "My name is "+ myUserName+". Here is my conversation with a friend:" + formattedChat + '\n\nIn 20 words or less, describe and explain to me how Jack,the other user, may interpret and feel upon reading my last message: ' + message + "\n\nIn your explanation, focus on the message's tone, writing style and meaning conveyed by my words and emojis (if I have used any emojis)."

  let ycMessage=""
  if(yesCategories.length>=1)
  {
    const messagesYC = [
      {role: "user", content:ycSamplePrompt},
      {role: "assistant", content:ycSampleContent},
      {role: "user", content:ycSamplePrompt},
      {role: "assistant", content:ycSampleContent},
      {role: "user", content: ycPrompt}
    ]

    ycMessage = await LLMPreview(initialPrompt,undefined,messagesYC)
  }
  else
  {
    ycMessage =await LLMPreview (cPrompt)
  }

  console.log("ycMessage:", ycMessage)
  
  /*
  const cPrompt = formattedChat + '\n\nYou labeled the last message in the conversation above as ' + yesCategories[0] +'. In the context of the conversation above, BRIEFLY describe in around 10 words how will the other user feel upon receiving this message: ' + message + "\n\n In your explanation, focus on the tone/intent/meaning conveyed by my words and emojis (if I have used any emojis)."
  const yPrompt =   formattedChat + '\n\nThe last message in the conversation above sounds' + yesCategories[0] +". Come up with an alternate message that does not sound " +yesCategories[0] +' Preserve the meaning of the original message. Encapsulate it in double quotes.';
  //const cPrompt = formattedChat + '\n\nDescribe the tone and intent conveyed by the text and any emojis in the last message in this conversation.'
  
  
  let alternateMessage = ""
  let toneIntent = ""

 
  //console.log("checkVal val", checkVal)
  if(checkVal.toUpperCase().includes("YES"))
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
    */

  return formatOutputNew(ycMessage,negFlag)
}



async function LLMProactivePipeLine({formattedChat,message})
{
  //initial check prompt
  console.log("formattedChat", formattedChat)
  const initialPrompt = formattedChat + '\n\nState if the tone/intent of the last message is blunt, offensive, rude, abusive, disrespectful or bullyish strictly in this format: "Yes" for yes and "No" for no.';
  console.log("initialPrompt PROACTIVE", initialPrompt)
  const yPrompt =   formattedChat + '\n\nCome up with an alternative message that is more appropriate. Preserve the meaning of the original message. Encapsulate it in double quotes.';
  //const cPrompt = formattedChat + '\n\nDescribe the tone and intent conveyed by the text and any emojis in the last message in this conversation.'
  const cPrompt = formattedChat + '\n\nIn the context of the conversation above, BRIEFLY describe in around 10 words how will the other user feel upon receiving this message from me in one sentence: ' + message + "\n\n In your explanation, focus on the tone/intent/meaning conveyed by my words and emojis (if I have used any emojis)."

  let alternateMessage = ""
  let toneIntent = ""

  let checkVal = await LLMPreview(initialPrompt)
  //console.log("checkVal val", checkVal)
  

  //console.log("initialPrompt val", initialPrompt)
  if(checkVal.toUpperCase().includes("Y"))
  {
    console.log("Message is not OK!", checkVal)
    alternateMessage = await LLMPreview(yPrompt)
    toneIntent =await LLMPreview (cPrompt)
    return formatOutput(alternateMessage, toneIntent)
  }
  else
  {
    console.log("Message is OK!", checkVal)
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
      initialPrompt = textConversation + '\n\nAbove, you will find my conversation with another user. In the context of the conversation above, explain in detail (around 20 words ideally) how would the other potentially feel upon reading this message:\n\n' + message +'\n\nExplain the tone and intent of the message as well.'
    }
    else
    {
      initialPrompt = textConversation + '\n\nHey GPT. Above, you will find my conversation with another user. In the context of the conversation above, explain, in detail, what the other user is implying in around 20 words ideally (refer to me as you):\n\n' + message +'\n\nFocus on the meaning, tone and intent of the message.'
    }
  }
  else
  {
    //initialPrompt = textConversation + '\n\nDescribe the tone and intent conveyed by the text and any emojis in the last message in this conversation in this format: "Tone: xyz. Intent: abc. " ';
   

    // initialPrompt = textConversation + '\n\nIn the conversation above, describe the tone and intent of the text/emojis in the next message in the conversation sent by' + (fromSelf? " me to the other user":"the other use to me") + 'in this conversation.\n\n'+ message + '\n\nFormat your output exactly as: "Tone: xyz. Intent: abc. " ';
    //console.log("Hey, this is the message", message)
    initialPrompt = textConversation + '\n\nIn the context of the conversation above, describe in detail the overall writng tone and meaning of the following message: \n\n'+ message + '\n\nFormat your output EXACTLY as: "Tone: sentence-with-tone Meaning: sentence-with-meaning. " ';

  }
  //console.log("Prompt:\n\n",initialPrompt)
  console.log("LLMInterpretation PROMPT:"+ (detail? "DETAIL":"") +"\n\n", initialPrompt)
  let replyGPT = await LLMPreview(initialPrompt);
  console.log("LLMInterpretation RESPONSE(GPT4)" + (detail? "DETAIL":"") +"\n\n", replyGPT)
  return replyGPT;

}


async function identifyComplexSentences({message})
{

  let currentConversation = await fetchChat();
  let textConversation = formatMessages(currentConversation);
  const initialPrompt = textConversation + '\n\nIn conversation above, the following message was sent next:\n\n' + message +
  '\n\nIn this specific message, identify phrases that you certainly believe contains figurative language. Identify' + 
  'any emojis too. Respond with % if there are none. You MUST copy AS IS from the message provided, and format your output in DOUBLE QUOTES like this: "phrase/emoji one" "phrase/emoji two"'
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
    initialPrompt = textConversation + '\n\nIn the conversation above, I sent the following to the other user ' + message +' in the message: '+ messageText +
    '\n\nExplain to me in simple language what would the receiver potentially think I am implying upon reading' + message + ' in the aforementioned context.'
  }
  else
  {
    initialPrompt = textConversation + '\n\nIn the conversation above, the following was sent by the other user to me \"' + message +'\" in this message:\"'+ messageText +
    '\"\n\nExplain the meaning of this figurative portion of the message in the above conversation\'s context (less than 30 words):' + message
  }
  console.log("explainComplexSentences PROMPT", initialPrompt)
  let replyGPT = await LLMPreview(initialPrompt);
  console.log("explainComplexSentences RESPONSE", replyGPT)
  return replyGPT;
}


async function generateResponse({formattedChat, responseNumber})
{
  //initial check prompt
  //admin panel  

  let replyGPT = ""

  const initialPrompt135 = "Here is a conversation: \n\n"+formattedChat + '\n\n This conversation is happening over a messaging app. Generate a response to continue the conversation, as if the conversation was happening with you. Act like a friend. Adapt your writing style (slang level, formality, punctuation) with the other person\'s writing style. Write in small letters. The other person has contacted you to plan a trip (but do not act like you already know this if the other person has not told you this yet). Keep your messages brief, as typically written messages are. Use simple language (no sarcasm/double meanings/emojis). Encapsulate the content of the response in double quotes like this: "the response message comes here" ';
  const initialPrompt2 ="Here is a conversation: \n\n"+formattedChat + '\n\n This conversation is happening over a messaging app. Generate a response to continue the conversation, as if the conversation was happening with you. Act like a friend. Adapt your writing style (slang level, formality, punctuation) with the other person\'s writing style. Write in small letters. The other person has contacted you to plan a trip (but do not act like you already know this if the other person has not told you this yet). Use idiomatic language. Encapsulate the content of the response in double quotes like this: "the response message comes here" ';
  const initialPrompt4 ="Here is a conversation: \n\n"+formattedChat + '\n\n This conversation is happening over a messaging app. Generate a response to continue the conversation, as if the conversation was happening with you. Act like a friend. Adapt your writing style (slang level, formality, punctuation) with the other person\'s writing style. Write in small letters. The other person has contacted you to plan a trip (but do not act like you already know this if the other person has not told you this yet). Keep your messages brief, as typically written messages are, and do not overshare. Use positive sarcasm. Encapsulate the content of the response in double quotes like this: "the response message comes here" ';
  const initialPrompt6 ="Here is a conversation: \n\n"+formattedChat + '\n\n This conversation is happening over a messaging app. Generate a response to continue the conversation, as if the conversation was happening with you. Act like a friend. Adapt your writing style (slang level, formality, punctuation) with the other person\'s writing style. Write in small letters. The other person has contacted you to plan a trip (but do not act like you already know this if the other person has not told you this yet). Keep your messages brief, as typically written messages are, and do not overshare. Use an emoji in your response whose meaning may not be straightforward. Encapsulate the content of the response in double quotes like this: "the response message comes here" ';

  console.log("RESP NUMBER", responseNumber)

  //const initialPrompt = formattedChat + '\n\n Act as if you are a friend of the other person, talking naturally like a human. Occasionally, respond with non-literal text. This conversation is happening over a nessaging app like WhatsApp. Take into account the previous conversation.';
  if(responseNumber===1)
  {
    replyGPT = await LLMPreview(initialPrompt135);
  }
  else if (responseNumber===2)
  {
    replyGPT = await LLMPreview(initialPrompt2);
  }
  else if (responseNumber===3)
  {
    replyGPT = await LLMPreview(initialPrompt135);
  }
  else if (responseNumber===4)
  {
    replyGPT = await LLMPreview(initialPrompt4);
  }
  else if (responseNumber===5)
  {
    replyGPT = await LLMPreview(initialPrompt135);
  }
  else if (responseNumber===6)
  {
    replyGPT = await LLMPreview(initialPrompt6);
  }
  
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