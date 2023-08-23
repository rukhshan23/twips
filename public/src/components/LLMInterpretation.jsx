
async function LLMInterpretation({formattedChat}) {
      try {
        console.log("chatasdfsafsadfsdasdfsda", formattedChat)
          const prompt = formattedChat + '\n\nDescribe the tone and intent conveyed by the text and any emojis in the last message in this conversation in this format: "Tone: xyz. Intent: abc. " ';
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
                  ]
              })
          });

          const data = await response.json();
          const dataResponse = data.choices[0].message.content;
          console.log("LLM Interpretation successful!")
          return dataResponse;
      } catch (error) {
        console.log("Error: ", error)
          return error;
      }

      
  

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

async function LLMPreviewPipeLine({formattedChat})
{
  //initial check prompt
  const initialPrompt = formattedChat + '\n\nState if the tone/intent of the last message is rude or abusive or bullyish in this format: "Y" for yes and "N" for no.';
  const yPrompt =   formattedChat + '\n\nCome up with an alternative message that is more positive/appropriate. Encapsulate it in double quotes.';
  const cPrompt = formattedChat + '\n\nDescribe the tone and intent conveyed by the text and any emojis in the last message in this conversation.'

  let alternateMessage = ""
  let toneIntent = ""

  if(await LLMPreview(initialPrompt) === 'Y')
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

async function LLMPreview(promptProp) {
  try {
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
              ]
          })
      });

      const data = await response.json();
      const dataResponse = data.choices[0].message.content;
      console.log("LLM Interpretation successful 122!")
      return dataResponse;
  } catch (error) {
    console.log("Error: ", error)
      return error;
  }


}

async function LLMProactivePipeLine({formattedChat})
{
  //initial check prompt
  const initialPrompt = formattedChat + '\n\nState if the tone/intent of the last message is rude or abusive or bullyish in this format: "Y" for yes and "N" for no.';
  const yPrompt =   formattedChat + '\n\nCome up with an alternative message that is more positive/appropriate. Encapsulate it in double quotes.';
  const cPrompt = formattedChat + '\n\nDescribe the tone and intent conveyed by the text and any emojis in the last message in this conversation.'

  let alternateMessage = ""
  let toneIntent = ""

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
  const initialPrompt = formattedChat + '\n\n What is the meaning of the following phrase in the conversation above: ' + phrase ;
  let replyGPT = await LLMPreview(initialPrompt);
  return replyGPT;

}




export {LLMInterpretation,LLMPreviewPipeLine,LLMProactivePipeLine,generateResponse,generateMeaning}