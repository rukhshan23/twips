
async function LLMInterpretation({formattedChat}) {
      try {
        console.log("chat", formattedChat)
          const prompt = formattedChat + '\n\nDescribe the tone and intent in my last message in this conversation';
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


export {LLMInterpretation}