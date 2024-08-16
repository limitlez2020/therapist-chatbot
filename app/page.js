"use client";

import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hello! I'm a virtual therapist. How can I help you today?",
  }])

  /* Message state for whatever ,message you'll be typing in the chat box: */
  const [message, setMessage] = useState("");

  /* Send current messages array to the backend and return the response: */
  const sendMessage = async () => {
    setMessage('');
    setMessages((messages) => [
      ...messages,
      {
        role: "user",
        content: message,
      },
      {
        role: "assistant",
        content: "",
      }
    ]);
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages,
          {
            role: 'user',
            content: message,
          }
        ]),
      });
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      let result = '';
      let done = false;
  
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
  
        const text = decoder.decode(value || new Uint8Array, { stream: !done });
        result += text;
  
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
      }
    } catch (error) {
      console.error("Error in Chat:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content: "Sorry, something went wrong.",
        },
      ]);
    }
  };
  

  // ORIGINAL:
  // const sendMessage = async () => {
  //   setMessage('')
  //   setMessages((messages) => [
  //     ...messages,
  //     {
  //       role: "user",
  //       content: message,
  //     },
  //     {
  //       role: "assistant",
  //       content: "",
  //     }
  //   ])

  //   const response = await fetch('/api/messages', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify([...messages,
  //       {
  //         role: 'user',
  //         content: message,
  //       }
  //     ]).then(async (res) => {
  //       const reader = res.body.getReader()
  //       const decoder = new TextDecoder()

  //       let result = ''
  //       return reader.read().then(function processText({done, value}){
  //         if (done){
  //           return result
  //         }

  //         const text = decoder.decode(value || new Uint8Array, {stream: true})
  //         setMessages((messages) => {
  //           let lastMessage = messages[messages.length - 1]
  //           let otherMessages = messages.slice(0, messages.length - 1)
  //           return[
  //             ...otherMessages,
  //             {
  //               ...lastMessage,
  //               content: lastMessage.content + text,
  //             },
  //           ]
  //         })
  //         return reader.read().then(processText)
  //       })
  //     })

  //   })
      
  // }

  

  return(
    <div className='w-full flex flex-col justify-center align-middle'>
      {/* Chat Area UI: */}
      <div className='flex min-h-screen flex-col items-center p-12'>
        {/* Messages */}
        <div className='flex flex-col space-y-2 space-x-2 flex-grow overflow-auto
                        max-h-full'>
          {/* DIsplay the messages: */}
          {
            messages.map((message, index) => (
              <div key={index}
                   className={`flex flex-col space-y-2
                              ${message.role === "assistant" ? "items-start" : "items-end"}`}>
                <div 
                  className={`p-2 text-white rounded-lg
                            ${message.role === "assistant" ? "bg-blue-600" : "bg-green-600"}`}>
                  {message.content}
                </div>
              </div>
            ))
          }
        </div>

        {/* Input UI: */}
        <div className='w-full flex flex-row items-center'>
          <input type='text' 
                 aria-label='message'
                 placeholder='message...'
                 className='flex-grow p-2 border-2 border-solid border-black rounded-lg'
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                 }}
                //  onKeyDown={(e) => {
                //    if (e.key === "Enter") {
                //      setMessages([...messages, {
                //        role: "user",
                //        content: message,
                //      }]);
                //      setMessage("");
                //    }
                //  }}
          />
          <button className='p-2 bg-blue-600 text-white rounded-lg'
                  onClick={sendMessage}
                  // onClick={() => {
                  //   setMessages([...messages, {
                  //     role: "user",
                  //     content: message,
                  //   }]);
                  //   setMessage("");
                  // }}
          >
            Send
          </button>
        </div>


      </div>
    </div>
  )
  
}