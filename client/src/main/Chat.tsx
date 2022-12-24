import axios from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";
import { Link } from "react-router-dom";
import { io, Socket } from 'socket.io-client';

export const Chat:FunctionComponent = () => {
    const [messages, setMessages] = React.useState<string[]>([]);
    const socket = io("http://localhost:5000/");

	console.log(socket)
    socket.emit("hello");

    useEffect(() => {
        socket.on('connection', () => {
            console.log('Connected to the server');
        });
		console.log('socket')
		console.log(socket)

        socket.on('message', (data: any) => {
            setMessages((prevMessages) => [...prevMessages, data.message]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);


    return (
    <div>
        {messages.map((message, index) => (
        <p key={index}>{message}</p>
        ))}
    </div>
    )
}