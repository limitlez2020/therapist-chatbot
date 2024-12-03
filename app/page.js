"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useRef } from 'react';
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
  /* Ref for the textarea for user to type -- so we can reset the size after each send */
  const textAreaRef = useRef(null);


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
      /* Await the response and extract the text from the response object */
      const data = await response.json();
      const text = data.text;

      /* Delay between each character in seconds -- simulate streaming */
      const typingDelay = 0.01;
  
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

    /* Reset the height of the textarea to default after sending */
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
    }
  };
  



  return(
    <div className={`${geologica.className} h-full w-full flex justify-center bg-[#212121] align-middle`}>
      {/* Chat Container */}
      <div className="flex flex-col min-h-screen w-full max-w-4xl px-12">
        {/* Header */}
        <header className="sticky top-0 bg-[#212121] w-full text-[#acacac] p-4 px-5 text-center font-semibold z-10">
          Virtual Therapy
        </header>

        {/* Messages */}
        {/* <div className="flex flex-col space-y-2 space-x-2 flex-grow max-h-full mb-16 w-full"> */}
        <div className="flex flex-col flex-grow overflow-y-auto space-y-2 mb-16">
          {/* Display Messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col w-full ${
                message.role === "assistant" ? "items-start" : "items-end"
              }`}
            >
              <div
                className={`p-2 rounded-lg max-w-[75%] font-light overflow-hidden overflow-wrap break-words mt-4 ${
                  message.role === "assistant"
                    ? "bg-[#3C3C3C] text-white overflow-x-auto"
                    : "bg-[#1F1F1F] text-white"
                }`}
                dangerouslySetInnerHTML={{ __html: md.render(message.content) }}
              />
            </div>
          ))}
        </div>

        {/* Input UI */}
        <div className='w-full pb-8 pt-2 sticky bottom-0 bg-[#212121]'>
          <div className={`${monstserrat.className} bg-[#373737] w-full h-grow flex flex-row gap-1
                          items-center justify-center rounded-3xl`}>
            <textarea
              ref={textAreaRef}   /* Attach ref to the textarea */
              aria-label="message"
              placeholder="message..."
              className="flex-grow my-2 pt-4 pl-4 pr-2 leading-normal focus:outline-none max-h-40
                        border-none bg-[#373737] text-white text-sm resize-none rounded-3xl
                        scrollbar-thin scrollbar-thumb-[#676767] scrollbar-track-[#373737]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                /* Set a threshold for desktop, so if the viewport goes below that, 
                * pressing enter will not send the message, the user will have to
                * explicitly press the send button -- For responsiveness on phones 
                */
                const isDesktop = window.innerWidth >= 768;
                if (e.key === "Enter" && !e.shiftKey && isDesktop) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              /* Make the height of the textarea be dynamic: */
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />
            <button
              className="p-2 font-bold text-sm mr-1"
              onClick={sendMessage}
            >
              <PaperAirplaneIcon className='size-5 text-white'/>
            </button>
          </div>
        </div>

      </div>
    </div>

  );
      
}
