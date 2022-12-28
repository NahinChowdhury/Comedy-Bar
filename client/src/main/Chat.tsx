import axios from 'axios';
import React, { FunctionComponent, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io();

interface ChatMessageInterface {
    messageId?: string | null;
    sender?: string;
    details?: string;
    read?: boolean;
    updatedAt?: string
}

export const Chat:FunctionComponent = () => {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessageInterface[]>([]);

    const [username, setUsername] = useState<string>(window.localStorage.getItem('user') || ``);
    const [socketName, setSocketName] = useState<string>(socket.id);
    const [room, setRoom] = useState<string>(`${Math.round(Math.random())%2}`);

    const [hasAccess, setHasAccess] = useState<boolean>(false);

    const {chatId} = useParams();

    useEffect(() => {
        // send request to backend to make sure current user has access to the chat
        // if not, turn off all socket functionalities

        axios.get(`/api/user/chat/${chatId}/hasAccess`)
            .then(res => {
                const { hasAccess } = res.data;
                
                setHasAccess(hasAccess);
            })
            .catch(e => {

                const error = e.response.data;
                console.log(e);
                console.log(error);


                switch(e.response.status){
                    case 401:
                        console.log("error 401")
                        break;
                    default:
                        alert(`${error.message}. CODE: ${error.code}`);
                }
            })
    }, [chatId])


    useEffect(() => {
        
        if(hasAccess){
            if(chatId === undefined){
                setHasAccess(false);
                return;
            }

            setRoom(chatId || "");
            // request to get all the chat history.
            // once you fetch all the data, then try to join the room
            requestData();
        }
    }, [socket, chatId, hasAccess]);

    useEffect(() => {

        if(hasAccess){
            // might need to fetch all the chat messages before listening to socket

            // Listen for a "receive_message" event from the server
            socket.on('receive_message', (data) => {
                // console.log(`Got message: ${data.message} by ${data.username}`)
                // expecting data of format {room, details, sender, updatedAt}
                setMessages([...messages, 
                    {
                        messageId: data.messageId,
                        sender: data.sender,
                        details: data.details,
                        read: data.read,
                        updatedAt: data.updatedAt
                    }
                ]);
            });

            // Listen for a "receive_message" event from the server
            socket.on('message_deleted', (data) => {
                
                console.log("message_deleted received");

                requestData();
                
            });
        
        }

    }, [socket, messages, hasAccess]);      

    
    const requestData = async () => {
        await axios.get(`/api/user/chat/${chatId}/getMessages`)
            .then(res => {
                const {messages} = res.data;

                if(messages.length === 0){
                    setMessages([]);
                    alert(`This chat has no previous messages.`);
                }else{

                    setMessages(() => {
                        return messages.map( (message:ChatMessageInterface) => {
                            return {
                                messageId: message.messageId,
                                sender: message.sender,
                                details: message.details,
                                read: message.read,
                                updatedAt: message.updatedAt
                            }
                        })
                    });
                }

                joinRoom();
                setSocketName(socket.id);
            })
            .catch(e => {

                const error = e.response.data;
                console.log(e);
                console.log(error);


                switch(e.response.status){
                    case 401:
                        console.log("error 401")
                        break;
                    default:
                        alert(`${error.message}. CODE: ${error.code}`);
                }
            })
    }

    const joinRoom = () => {
        // console.log("sent join req")
        socket.emit('join_room', {room: chatId, username});
    }
    // need a useEffect to make sure the user accessing this page has permission to access this page
    
    const handleSendMessage = async () => {
        if(hasAccess){
            
            const messageToSend = message;

            await axios.post(`/api/user/chat/${chatId}/createMessage`, {details: messageToSend})
                .then(res => {
                    const {messageCreated} = res.data;

                    // message has been saved in the database
                    console.log("Sending to socket: " + room, messageCreated.messageId, messageCreated.sender, messageCreated.details, messageCreated.read, messageCreated.updatedAt)
                    // Send a "send_message" event to the server
                    socket.emit('send_message', { room, messageId: messageCreated.messageId, sender: messageCreated.sender, details: messageCreated.details, read: messageCreated.read, updatedAt: messageCreated.updatedAt });
                    setMessage('');
                })
                .catch(e => {

                    const error = e.response.data;
                    console.log(e);
                    console.log(error);


                    switch(e.response.status){
                        case 401:
                            console.log("error 401")
                            break;
                        default:
                            alert(`${error.message}. CODE: ${error.code}`);
                    }
                })
        }
    };

    const handleDeleteMessage = async (messageToBeDeleted: ChatMessageInterface) => {
        if(hasAccess){
            
            await axios.post(`/api/user/chat/${chatId}/deleteMessage`, {messageId: messageToBeDeleted.messageId})
                .then(res => {
                    const {messageDeleted} = res.data;
                    
                    // message has been saved in the database
                    console.log("Sending to socket for delete: " + room, messageDeleted.messageId, messageDeleted.sender, messageDeleted.details, messageDeleted.read, messageDeleted.updatedAt)
                    // Send a "send_message" event to the server
                    socket.emit('delete_message', { room, messageId: messageDeleted.messageId });
                })
                .catch(e => {

                    const error = e.response.data;
                    console.log(e);
                    console.log(error);


                    switch(e.response.status){
                        case 401:
                            console.log("error 401")
                            break;
                        default:
                            alert(`${error.message}. CODE: ${error.code}`);
                    }
                })
        }
    };

    return (
        hasAccess ?
        <div>
            <div>User: {username}</div>
            <div>Socket Name: {socketName}</div>
            <div>Room: {room}</div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={ async () => {
                await handleSendMessage();
            }}>Send</button>
            <ul>
                {messages.map((message, i) => (
                    <li key={i}>
                        {`${message.sender}: ${message.details} at ${message.updatedAt}          Message ID: ${message.messageId}`}
                        {username === message.sender && <button onClick={() => {handleDeleteMessage(message)}}>Delete</button>}
                    </li>
                ))}
            </ul>
        </div>:
        <>User does not have access to this page. Please try to log in and try again</>
    );
}