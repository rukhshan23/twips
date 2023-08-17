
async function LLMInterpretation({formattedChat}) {
      try {
        console.log("chat", formattedChat)
          const prompt = formattedChat + '\n\nDescribe the tone and intent in the last message in this conversation.';
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
    altMsg = 'You might want to consider saying: "'+match[1]+'"'; // Return the matched text without the double quotes
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
  const initialPrompt = formattedChat + '\n\nState if the tone/intent of the last message is rude/abusive/bullyish in this for format: "Y" for yes and "N" for no.';
  const yPrompt =   formattedChat + '\n\nCome up with an alternative message that is more positive/appropriate. Encapsulate it in double quotes.';
  const cPrompt = formattedChat + '\n\nDescribe the tone and intent of the last message in this conversation.'

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





export {LLMInterpretation,LLMPreviewPipeLine}