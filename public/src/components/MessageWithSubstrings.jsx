import React from 'react';
import {explainComplexSentences} from './LLMInterpretation.jsx'

const MessageWithSubstrings = ({fromSelf, message, messageID, substringArray,setComplexExplanation, complexExplanation, setDetail, setClickedMessageId }) => {
  const handleSubstringClick = async (substring) => {

    // if(complexExplanation !== "")
    // {
    //   console.log("Here")
    //   setComplexExplanation("")
    //   setClickedMessageId("");
    // }
    // else
    // {
    //   console.log("Here2")
      
      setComplexExplanation("Analyzing...");
      setClickedMessageId(messageID);
      let explanation = await explainComplexSentences({message:substring, fromSelf:fromSelf, messageText:message});
      setComplexExplanation(explanation);
    // }
    setDetail(false);
    
  };

  const generateMessageWithSpans = () => {
    let currentIdx = 0;
    const components = [];


    while (currentIdx < message.length) {
      const nextSubstring = substringArray.find(substring => message.startsWith(substring, currentIdx));
      

      if (nextSubstring) {
      
        const spanWithWords = (
          <span
            key={currentIdx}
            style={{ fontWeight: 'normal', cursor: 'pointer', whiteSpace: 'break-spaces' }}
          >
            {nextSubstring.split('').map((char, index) => (
              <span
                key={index}
                
                onClick = {(e)=> {e.stopPropagation(); handleSubstringClick(nextSubstring)}}
                style={{ textDecoration: 'underline', fontWeight: 'bold', cursor: 'pointer', color:"" }}
              >
                {char}
              </span>
            ))}
          </span>
        );

        components.push(spanWithWords);
        currentIdx += nextSubstring.length;
      } else {
        components.push(message[currentIdx]);
        currentIdx++;
      }

    }

    return components;
  };

  return (
    <p style={{ lineHeight: '1.4' }}>
      {generateMessageWithSpans()}
    </p>
  );
};

export default MessageWithSubstrings;
