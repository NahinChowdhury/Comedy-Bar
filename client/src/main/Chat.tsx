import axios from 'axios';
import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { isNumber } from '../helperFunctions/smallHelpers';
import io from 'socket.io-client';

const socket = io();

interface ChatMessageInterface {
    messageId?: string | null;
    sender?: string;
    details?: string;
    read?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdAtString?: string;
    updatedAtString?: string;
    isEditing?: boolean;
}

export const Chat:FunctionComponent = () => {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessageInterface[]>([]);

    const [socketName, setSocketName] = useState<string>(socket.id);
    const [room, setRoom] = useState<string>(``);
    
    const [hasAccess, setHasAccess] = useState<boolean>(false);
    const [editMessageDetails, setEditMessageDetails] = useState<string>('');
    
    const {chatId} = useParams();
    const username = window.localStorage.getItem('user') || ``;
    const messagesEndRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // send request to backend to make sure current user has access to the chat
        // if not, turn off all socket functionalities

        if(chatId === undefined || !isNumber(chatId)){
            setHasAccess(false);
            return;
        }

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

            setRoom(chatId || "");
            // request to get all the chat history.
            // once you fetch all the data, then try to join the room
            requestData();
        }
    }, [chatId, hasAccess]);

    useEffect(() => {

        if(hasAccess){
            // might need to fetch all the chat messages before listening to socket

            // Listen for a "receive_message" event from the server
            socket.on('receive_message', (data) => {
                // console.log(`Got message: ${data.message} by ${data.username}`)
                // expecting data of format {room, messageId, sender, details, read, updatedAt}
                setMessages([...messages, 
                    {
                        messageId: data.messageId,
                        sender: data.sender,
                        details: data.details,
                        read: data.read,
                        createdAt: new Date(data.createdAt),
                        updatedAt: new Date(data.updatedAt),
                        createdAtString: data.createdAtString,
                        updatedAtString: data.updatedAtString,
                        isEditing: false
                    }
                ]);
            });

            // Listen for a "message_deleted" event from the server
            socket.on('message_deleted', (data) => {
                
                console.log("message_deleted received");
                
				// Expecting data to be {room, messageId, sender, details, read, updatedAt}
                setMessages( prevMessages => {
                    return prevMessages.filter((message: ChatMessageInterface) => message.messageId !== data.messageId);
                })
                
            });
            
            // Listen for a "message_edited" event from the server
            socket.on('message_edited', (data) => {
                
                console.log("message_edited received");
                
				// Expecting data to be {room, messageId, sender, details, read, updatedAt}
                setMessages( (prevMessages: ChatMessageInterface[]) => {
                    return prevMessages.map((message: ChatMessageInterface) => {
                        if(message.messageId !== data.messageId){
                            return message;
                        }
                        return {
                            ...message,
                            details: data.details,
                            updatedAt: new Date(data.updatedAt),
                            updatedAtString: data.updatedAtString,
                            isEditing: false
                        }
                    });
                });

                setEditMessageDetails("");
                
            });
        }

    }, [messages, hasAccess]);      

    
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
                                createdAt: new Date(message.createdAt!),
                                updatedAt: new Date(message.updatedAt!),
                                createdAtString: message.createdAtString,
                                updatedAtString: message.updatedAtString,
                                isEditing: false
                            }
                        })
                    });
                }
                scrollToLastMessage();
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
    
    const sendMessageOnEnter = async (event: React.KeyboardEvent) => {
        
        if(event.key === 'Enter' && event.shiftKey){
            console.log("shift enter clicked in send")
            // setMessage(prevMessage => {return `${prevMessage}\n`});
            return;
        }

        if (event.key === 'Enter') {
            await handleSendMessage();
            return;
        }
    }
    
    const editMessageOnEnter = async (event: React.KeyboardEvent, messageToBeEditedID: string, messageToBeEditedDetails: string, originalMessageDetails: string) => {
        if(event.key === 'Enter' && event.shiftKey){
            console.log("shift enter clicked in edit")
            // setMessage(prevMessage => {return `${prevMessage}\n`});
            return;
        }

        if (event.key === 'Enter') {
            await handleEditMessage(messageToBeEditedID, messageToBeEditedDetails, originalMessageDetails);
        }
    }

    const handleSendMessage = async () => {
        if(hasAccess){
            
            scrollToLastMessage();
            const messageToSend = message;
            if(messageToSend === ""){
                console.log("Tried to pass empty message. Averted.")
                return;
            }

            await axios.post(`/api/user/chat/${chatId}/createMessage`, {details: messageToSend})
                .then(res => {
                    const {messageCreated} = res.data;

                    // message has been saved in the database
                    console.log("Sending to socket: " + room, messageCreated.messageId, messageCreated.sender, messageCreated.details, messageCreated.read, messageCreated.updatedAt)
                    // Send a "send_message" event to the server
                    socket.emit('send_message', { 
                        room,
                        messageId: messageCreated.messageId,
                        sender: messageCreated.sender,
                        details: messageCreated.details,
                        read: messageCreated.read,
                        createdAt: messageCreated.createdAt,
                        updatedAt: messageCreated.updatedAt,
                        createdAtString: messageCreated.createdAtString,
                        updatedAtString: messageCreated.updatedAtString
                    });
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
    
    const handleEditMessage = async (messageToBeEditedID: string, messageToBeEditedDetails: string, originalMessageDetails: string) => {
        if(hasAccess){
            
            if(messageToBeEditedDetails === ""){
                alert("Messages cannot be empty.");
                return;
            }

            if(messageToBeEditedID === ""){
                alert("Having issues trying to edit. Please reload the page and try again.");
                return;
            }

            if(messageToBeEditedDetails === originalMessageDetails){
                alert("No changes were made to the message.");
                return;
            }


            await axios.put(`/api/user/chat/${chatId}/editMessage`, {messageId: messageToBeEditedID, messageDetails: messageToBeEditedDetails})
                .then(res => {
                    const {messageEdited} = res.data;
                    
                    // message has been saved in the database
                    console.log("Sending to socket for edit: " + 
                        room + 
                        messageEdited.messageId +
                        messageEdited.sender +
                        messageEdited.details +
                        messageEdited.read +
                        messageEdited.createdAt +
                        messageEdited.updatedAt +
                        messageEdited.createdAtString +
                        messageEdited.updatedAtString 
                    )
                    // Send a "send_message" event to the server
                    socket.emit('edit_message', { 
                        room, 
                        messageId: messageEdited.messageId,
                        sender: messageEdited.sender,
                        details: messageEdited.details,
                        read: messageEdited.read,
                        createdAt: messageEdited.createdAt,
                        updatedAt: messageEdited.updatedAt,
                        createdAtString: messageEdited.createdAtString,
                        updatedAtString: messageEdited.updatedAtString 
                    });
                    
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

    const scrollToLastMessage = () => {
        if (messagesEndRef.current !== null) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
    }

    const renderPlainMessage = (message: ChatMessageInterface, color: string) => {
        return(
            <>
                <div>
                <span style={{ color: color }}> <strong>{`${message.sender}: `}</strong> </span> 
                <strong>{`${message.details} `}</strong> 
                </div>
                <div>

                    <em>{`at ${message.createdAtString} `}</em>  
                    {message.updatedAt!.getTime() !== message.createdAt!.getTime() && <>{`(edited at ${message.updatedAtString}) `}</>}
                </div>
            </>
        )

    }


    return (
        hasAccess ?
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>

            <div style={{ overflowY: 'auto' }}>
                <ul style={{ display: 'flex', flexDirection: 'column', marginBottom: '50px' }}>
                    {messages.map((message: ChatMessageInterface, i) => (
                        <li 
                            key={i} 
                            style={{
                            display: 'flex',
                            flexDirection: message.sender === username ? 'row-reverse' : 'row',
                            alignItems: 'center',
                            marginBottom: 10
                        }}>
                            <div>
                                {
                                    username !== message.sender ?
                                    <>
                                        {/* If message is not from me */}
                                        {renderPlainMessage(message, "steelblue")}
                                    </>
                                    :
                                    <>
                                        {/* If message is from me */}

                                        {message.isEditing ?
                                        <>
                                            <input 
                                                type="text" 
                                                value={editMessageDetails} 
                                                onChange={(e) => {setEditMessageDetails(e.target.value)}}
                                                onKeyDown={ (e) => { editMessageOnEnter(e, message.messageId||"", editMessageDetails, message.details||"") }}
                                                style={{ width: '35vw' }}
                                            />
                                            <button
                                                onClick={() => {handleEditMessage(message.messageId!, editMessageDetails, message.details!)}}
                                                disabled={message.details === editMessageDetails ? true : false}
                                            >Confirm</button>

                                            <button onClick={() => {
                                                setMessages( (prevMessages: ChatMessageInterface[]) => {
                                                    return prevMessages.map( (currMessage:ChatMessageInterface) => {
                                                        if(currMessage.messageId === message.messageId) {
                                                            return {
                                                                ...currMessage,
                                                                isEditing: false
                                                            }
                                                        }else{
                                                            return currMessage
                                                        }
                                                    })
                                                });
                                                setEditMessageDetails("");
                                            }}>Cancel</button>
                                        </>
                                        :
                                        <>
                                            {renderPlainMessage(message, "crimson")}

                                            <button 
                                                onClick={() => {
                                                    setMessages( (prevMessages: ChatMessageInterface[]) => {
                                                        return prevMessages.map((currMessage: ChatMessageInterface) => {
                                                            if(currMessage.messageId === message.messageId) {
                                                                return {
                                                                    ...currMessage,
                                                                    isEditing: true
                                                                }
                                                            }else{
                                                                return {
                                                                    ...currMessage,
                                                                    isEditing: false
                                                                }
                                                            }
                                                        })
                                                    });
                                                    setEditMessageDetails(message.details!); // need to add empty string to avoid error
                                                }}
                                            >Edit</button>
                                            <button onClick={() => {handleDeleteMessage(message)}}>Delete</button>
                                        </>
                                        }
                                    </>
                                }
                            </div>
                        </li>
                    ))}
                    <div ref={messagesEndRef} />
                </ul>
            </div>
            
            <div>User: <span style={{ color: 'crimson' }}> <strong>{username}</strong> </span></div>
            <div>Room: {room}</div>

            <div style={{ display: 'flex', justifyContent: 'center'}}>

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={ (e) => { sendMessageOnEnter(e) }}
                    style={{ width: '75vw' }}
                    />
                <button onClick={ () => { handleSendMessage() }}>Send</button>

            </div>
            
        </div>:
        <>User does not have access to this page. Please try to log in and try again</>
    );
}