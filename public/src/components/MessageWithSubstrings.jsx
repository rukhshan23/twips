import React from 'react';

const MessageWithSubstrings = ({ message, messageID, substringArray,setComplexExplanation, complexExplanation, setDetail, setClickedMessageId }) => {
  const handleSubstringClick = (substring) => {
    
    if(complexExplanation !== "")
    {
      console.log("Here")
      setComplexExplanation("")
      setClickedMessageId("");
    }
    else
    {
      console.log("Here2")
      setClickedMessageId(messageID);
      setComplexExplanation(substring);
    }
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
                style={{ fontWeight: 'bold', cursor: 'pointer', color:"#FFC8C8" }}
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
