"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Montserrat } from 'next/font/google';
import { Geologica } from 'next/font/google';
import { Open_Sans } from 'next/font/google';
import MarkdownIt from 'markdown-it';
import MarkdownItLinkAttributes from "markdown-it-link-attributes"
import { PaperAirplaneIcon } from '@heroicons/react/20/solid';

const monstserrat = Montserrat({ subsets: ['latin'] });
const geologica = Geologica({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});
const openSans = Open_Sans({ subsets: ['latin'] });

export default function Home() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hey there.",
  }])

  /* Message state for whatever ,message you'll be typing in the chat box: */
  const [message, setMessage] = useState("");


  /* Create a markdown instance: */
  const md = new MarkdownIt({
    html: true,
    linkify: true
  })
    .use(MarkdownItLinkAttributes, {
      pattern: /^https?:\/\//,
      attrs: {
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'text-blue-500 underline'
      }
    });


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


      /* STREAM RESPONSE FROM AI API: */
      /* Await the response and convert it to text */
      const text = await response.text();

      /* Delay between each character in seconds -- simulate streaming */
      const typingDelay = 0.1;
  
      /* Display each character in the response at a given index */
      const displayCharacter = (index) => {
        setTimeout(() => {
          /* Update the last message in the array with the new character */
          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            return [
              ...prevMessages.slice(0, -1),
              {
                ...lastMessage,
                content: lastMessage.content + text[index],
              },
            ];
          });
  
          /* If we haven't reached the end of the chatbot's 
             response, display the next character */
          if (index < text.length - 1) {
            displayCharacter(index + 1);
          }
          /* Delay the execution of this function based on the index */
        }, typingDelay * index);
      };
  
      /* Start displaying the response character by character */
      displayCharacter(0);
      /* END OF STREAMING */

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
  



  return(
    // <div className={`${geologica.className} w-full flex flex-col justify-center bg-[#212121]
    //                align-middle border-black/20 border-2 shadow-inner`}>
    //   {/* Chat Container: */}
    //   <div className='flex min-h-screen flex-col items-center p-12'>
    //     {/* Messages */}
    //     <div className='flex flex-col space-y-2 space-x-2 flex-grow
    //                     max-h-full mb-16'>
    //       {/* DIsplay the messages: */}
    //       {
    //         messages.map((message, index) => (
    //           <div key={index}
    //                className={`flex flex-col space-y-2
    //                           ${message.role === "assistant" ? "items-start" : "items-end"}`}>
    //             {/* We add markdown so the response from the AI is easier to read */}
    //             <div 
    //               className={`p-2 rounded-lg
    //                         ${message.role === "assistant" ? "bg-[#3C3C3C] text-white" : "bg-white text-black"}`}
    //               dangerouslySetInnerHTML={{ __html: md.render(message.content) }}
    //             />
    //           </div>
    //         ))
    //       }
    //     </div>

    //     {/* Input UI: */}
    //     <div className={`${monstserrat.className} w-full flex flex-row items-center justify-center gap-4`}>
    //       <input type='text' 
    //              aria-label='message'
    //              placeholder='message...'
    //              className='flex-grow p-2 border-2 border-solid bg-white text-sm
    //                       border-black text-black font-semibold rounded-lg'
    //              value={message}
    //              onChange={(e) => setMessage(e.target.value)}
    //              onKeyDown={(e) => {
    //                 if (e.key === "Enter") {
    //                   sendMessage();
    //                 }
    //              }}
    //       />
    //       <button className='p-2 bg-[#fede65] text-black rounded-lg border-black
    //                          border-2 font-bold text-sm'
    //               onClick={sendMessage}
    //       >
    //         {/* <PaperAirplaneIcon className="size-5"/> */}
    //         Send
    //       </button>
    //     </div>
    //   </div>
    // </div>

    <div className={`${geologica.className} h-full w-full flex justify-center bg-[#212121] align-middle`}>
      {/* Chat Container */}
      <div className="flex flex-col min-h-screen w-full max-w-4xl p-12">
        {/* Messages */}
        <div className="flex flex-col space-y-2 space-x-2 flex-grow max-h-full mb-16">
          {/* Display Messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col space-y-2 ${
                message.role === "assistant" ? "items-start" : "items-end"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  message.role === "assistant"
                    ? "bg-[#3C3C3C] text-white"
                    : "bg-[#1F1F1F] text-white"
                }`}
                dangerouslySetInnerHTML={{ __html: md.render(message.content) }}
              />
            </div>
          ))}
        </div>

        {/* Input UI */}
        <div className={`${monstserrat.className} bg-[#373737] w-full h-grow flex flex-row gap-1 items-center justify-center rounded-3xl`}>
          <textarea
            aria-label="message"
            placeholder="message..."
            className="flex-grow my-3 pt-2 px-4 leading-none focus:outline-none max-h-40 border-none bg-[#373737] text-white text-sm resize-none rounded-3xl"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
                e.target.style.height = "auto";
              }
            }}
            /* Make the height of the textarea be dynamic: */
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
          <button
            className="p-2 font-bold text-sm"
            onClick={sendMessage}
          >
            <PaperAirplaneIcon className='size-5 text-white'/>
          </button>
        </div>
      </div>
    </div>

  );
      
}
