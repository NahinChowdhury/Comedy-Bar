import React, { FunctionComponent, useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

export const Chat:FunctionComponent = () => {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);

    const [username, setUsername] = useState<string>(window.localStorage.getItem('user') || `Guest_${Math.floor(Math.random() * 1000) + 1}`);
    const [socketName, setSocketName] = useState<string>(socket.id);
    const [room, setRoom] = useState<string>(`${Math.round(Math.random())%2}`);

    useEffect(() => {
        console.log("sent join req")
        socket.emit('join_room', {room, username});
        setSocketName(socket.id);
    }, [socket])

    useEffect(() => {
        // Listen for a "receive_message" event from the server
        socket.on('receive_message', (data) => {
            console.log(`Got message: ${data.message} by ${data.username}`)
            setMessages([...messages, `${data.message} by ${data.username}`]);
        });
        setSocketName(socket.id)

    }, [socket, messages]);      

    const handleSendMessage = () => {
        // Send a "send_message" event to the server
        socket.emit('send_message', {room, message, username});
        setMessage('');
    };

    return (
        <div>
            <div>User: {username}</div>
            <div>Socket Name: {socketName}</div>
            <div>Room: {room}</div>
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