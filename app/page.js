"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Montserrat } from 'next/font/google';
import { Prompt } from 'next/font/google';
import MarkdownIt from 'markdown-it';
import MarkdownItLinkAttributes from "markdown-it-link-attributes"

const monstserrat = Montserrat({ subsets: ['latin'] });
const prompt = Prompt({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

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
        rel: 'noopener'
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
  



  return(
    <div className={`${prompt.className} w-full flex flex-col justify-center bg-[#ceccd2]
                   align-middle border-black/20 border-2 shadow-inner`}>
      {/* Chat Area UI: */}
      <div className='flex min-h-screen flex-col items-center p-12'>
        {/* Messages */}
        <div className='flex flex-col space-y-2 space-x-2 flex-grow
                        max-h-full mb-16'>
          {/* DIsplay the messages: */}
          {
            messages.map((message, index) => (
              <div key={index}
                   className={`flex flex-col space-y-2
                              ${message.role === "assistant" ? "items-start" : "items-end"}`}>
                {/* We add markdown so the response from the AI is easier to read */}
                <div 
                  className={`p-2 rounded-lg
                            ${message.role === "assistant" ? "bg-[#3C3C3C] text-white" : "bg-white text-black"}`}
                  dangerouslySetInnerHTML={{ __html: md.render(message.content) }}
                />
              </div>
            ))
          }
        </div>

        {/* Input UI: */}
        <div className={`${monstserrat.className} w-full flex flex-row items-center justify-center gap-4`}>
          <input type='text' 
                 aria-label='message'
                 placeholder='message...'
                 className='flex-grow p-2 border-2 border-solid bg-white text-sm
                          border-black text-black font-semibold rounded-lg'
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                 }}
          />
          <button className='p-2 bg-[#fede65] text-black rounded-lg border-black
                             border-2 font-bold text-sm'
                  onClick={sendMessage}
          >
            {/* <PaperAirplaneIcon className="size-5"/> */}
            Send
          </button>
        </div>
      </div>
    </div>
  );
  
}
