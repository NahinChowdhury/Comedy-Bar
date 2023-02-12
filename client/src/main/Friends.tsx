import axios from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";

// requestSent means this person sent a request to out user
// requestReceived means this person received a request from our user
interface FriendInterface {
    friendId: string;
    createdAt: string;
}

interface RequestInterface {
    requestId: string,
    senderId: string,
    receiverId: string;
    createdAt: string
}

export const Friends:FunctionComponent = () => {

    const [friends, setFriends] = useState<FriendInterface[]>([]);
    const username = window.localStorage.getItem("user") || "";

    useEffect(() => { 
        requestData();
    },[])


    const requestData = () => {
        axios.get('/api/user/friends')
        .then(res => {
            const {friends} = res.data;

            console.log('friends')
            console.log(friends)

            setFriends(friends);
        })
        .catch(e => {

            const error = e.response.data;
            console.log(e);
            console.log(error);
            setFriends([]);
            switch(e.response.status){
                case 401:
                    console.log("error 401")
                    break;
                default:
                    // alert(`${error.message}. CODE: ${error.code}`);
            }
        })
    }

    const removeFriend = (friendId: string) => {

        axios.delete(`/api/user/friends/remove/${friendId}`)
        .then(res => {
            requestData();
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
        <div className="friends">

            <h1>Here are your friends</h1>

            {friends.length > 0 ? 
                friends.map(user => {
                    return (
                        <div key={user.friendId}>
                            {`${user.friendId} since ${user.createdAt}`}
                            <button onClick={() => removeFriend(user.friendId)}>
                                {"Remove Friend"}
                            </button>
                        </div>
                    )
                })
            :
                <div>
                    {"You have no friends"}
                </div>
            }

        </div>
    )
}