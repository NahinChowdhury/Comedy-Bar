import axios from 'axios';
import React, { FunctionComponent, useState, useEffect } from 'react';

export const ChooseChat:FunctionComponent = () => {
    
    interface UserInterface {
        username: string;
    }

    interface ChatRoomInterface {
        roomId: string;
        existed: boolean;
    }
    
    const [users, setUsers] = useState<UserInterface[]>([]);

    // I want to request from the backend, all the users available except for me.
    // and display then in rows. User can click a button and start chat with them

    useEffect(() => { 
        axios.get('/api/global/user/getAllOtherUsers')
        .then(res => {
            const { allUsers } = res.data;
            console.log('allUsers')
            console.log(allUsers)
            setUsers(allUsers);
        })
        .catch(e => {

            const error = e.response.data;
            console.log(e);
            console.log(error);
            setUsers([]);
            switch(e.response.status){
                case 401:
                    console.log("error 401")
                    break;
                default:
                    alert(`${error.message}. CODE: ${error.code}`);
            }
        })
    },[])

    const joinRoom = async (otherMember: string) => {

        // send a request to backend with username of other person
        // to see if a chat room already exists with this user
        // if it does, then send the room id
        // if it doesn't then create a room and send the id
        // also send a flag for whether it was just created or already existed

        // if there is an error while creating or fetching the room id, send error
        await axios.post("/api/user/chat/findChat", {otherMember: otherMember})
            .then(res => {
                const { chatRoom } = res.data;
                console.log(chatRoom)
                chatRoom.existed === true ? alert("Chat room already exists") : alert("Chat room was created")
                window.location.assign(`${window.location.pathname}/${chatRoom.roomId}`);
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
    
    return (
        <div className="ChooseChat">

            <h1>Choose or create a chat with a person</h1>

            {users.length > 0 && 
                users.map(user => {
                    return (
                        <div key={user.username}>
                            <span>{user.username} </span>
                            <button onClick={() => {
                                joinRoom(user.username)
                            }}>Join or Start Chat</button>
                            <br /><br />
                        </div>
                    )
                })
            }

        </div>
    )
}