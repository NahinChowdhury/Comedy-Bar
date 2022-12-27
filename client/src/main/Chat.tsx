import React, { FunctionComponent, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io();

interface ChatMessage {
    messageId?: string | null;
    sender?: string;
    details?: string;
    read?: boolean;
    updatedAt?: string
}

export const Chat:FunctionComponent = () => {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const [username, setUsername] = useState<string>(window.localStorage.getItem('user') || `Guest_${Math.floor(Math.random() * 1000) + 1}`);
    const [socketName, setSocketName] = useState<string>(socket.id);
    const [room, setRoom] = useState<string>(`${Math.round(Math.random())%2}`);

    const {chatId} = useParams();

    useEffect(() => {

        setRoom(chatId || ""); // should make sure chatId is valid before requesting to join
        // console.log("sent join req")
        socket.emit('join_room', {room: chatId, username});
        setSocketName(socket.id);
    }, [socket])

    useEffect(() => {

        // might need to fetch all the chat messages before listening to socket

        // Listen for a "receive_message" event from the server
        socket.on('receive_message', (data) => {
            // console.log(`Got message: ${data.message} by ${data.username}`)
            // expecting data of format {room, details, sender, updatedAt}
            setMessages([...messages, 
                {
                    sender: data.sender,
                    details: data.details,
                    read: false,
                    updatedAt: data.updatedAt
                }
            ]);
        });
        setSocketName(socket.id)

    }, [socket, messages]);      

    const convertToAMPM = (date: Date) => {
        return `${date.toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })} ${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`
    }

    // need a useEffect to make sure the user accessing this page has permission to access this page

    const handleSendMessage = () => {
        // Send a "send_message" event to the server
        socket.emit('send_message', {room, details: message, sender: username, updatedAt: convertToAMPM(new Date())});
        setMessage('');

        // need to send a post req to backend to save the message sent
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
                    <li key={i}>{`${m.sender}: ${m.details} at ${m.updatedAt}`}</li>
                ))}
            </ul>
        </div>
    );
}