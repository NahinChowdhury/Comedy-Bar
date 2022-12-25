import React, { FunctionComponent, useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

export const Chat:FunctionComponent = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Listen for a "message" event from the server
    console.log("socket getting message")
    socket.on('message', (receivedMessage) => {
        console.log("Got message")
        setMessages([...messages, receivedMessage]);
    });
  }, [messages]);

  const handleSendMessage = () => {
    // Send a "message" event to the server
    socket.emit('message', message);
    setMessage('');
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

export default Chat;