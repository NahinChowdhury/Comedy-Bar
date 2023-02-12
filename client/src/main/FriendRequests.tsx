import axios from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";

// requestSent means this person sent a request to out user
// requestReceived means this person received a request from our user
interface UserInterface {
    username: string;
    requestSent: boolean;
    requestReceived: boolean;
    friends: boolean;
}

interface RequestInterface {
    requestId: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
    updatedAt: string;
}

export const FriendRequests:FunctionComponent = () => {

    const [users, setUsers] = useState<UserInterface[]>([]);
    const [requestsReceived, setRequestsReceived] = useState<RequestInterface[]>([]);
    const [requestsSent, setRequestsSent] = useState<RequestInterface[]>([]);
    const username = window.localStorage.getItem("user") || "";

    useEffect(() => { 
        axios.get('/api/user/friendRequests/getAllUsersAndFriendshipStatus')
        .then(res => {
            const {allUsersAndStatus} = res.data;

            console.log('allUsersAndStatus')
            console.log(allUsersAndStatus)

            setUsers(allUsersAndStatus);
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

        requestFriendrequestReceivedAndSentData()

    },[])

    const requestFriendrequestReceivedAndSentData = () => {
        axios.get('/api/user/friendRequests')
        .then(res => {
            const {requests} = res.data;

            console.log('requests')
            console.log(requests)

            setRequestsReceived(requests);
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
                    // alert(`${error.message}. CODE: ${error.code}`);
            }
        })

        axios.get('/api/user/friendRequests/sent')
        .then(res => {
            const {requests} = res.data;

            console.log('requests')
            console.log(requests)

            setRequestsSent(requests);
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
                        // alert(`${error.message}. CODE: ${error.code}`);
                }
            }
        )
    }

    const submitData = (username: string) => {

        axios.post("/api/user/friendRequests/send", {receiverId: username})
            .then(res => {

                setUsers(prevUsers => {
                    return prevUsers.map(user => {
                        if(user.username === username){
                            return {
                                ...user,
                                requestSent: true
                            }
                        }
                        return user;
                    })
                })

                requestFriendrequestReceivedAndSentData();
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

    // receiverId is the our current user
    // senderId is the user who sent the request and exists in users state variable
    const acceptRequest = (requestId: string, receiverId: string, senderId: string) => {

        axios.post(`/api/user/friendRequests/accept/${requestId}`, {receiverId: receiverId})
        .then(res => {
            
            // remove request from requestsReceived
            setRequestsReceived(prevRequests => {
                return prevRequests.filter(request => request.requestId !== requestId)
            })
            
            // update users.requestsReceived
            setUsers(prevUsers => {
                return prevUsers.map(user => {
                    if(user.username === senderId){
                        return {
                            ...user,
                            requestReceived: false,
                            friends: true
                        }
                    }
                    return user;
                })
            })
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
    
    // receiverId is the our current user
    // senderId is the user who sent the request and exists in users state variable
    const rejectRequest = (requestId: string, receiverId: string, senderId: string) => {

        axios.post(`/api/user/friendRequests/reject/${requestId}`, {receiverId: receiverId})
        .then(res => {
            // remove request from requestsReceived
            setRequestsReceived(prevRequests => {
                return prevRequests.filter(request => request.requestId !== requestId)
            })
            
            // update users.requestsReceived
            setUsers(prevUsers => {
                return prevUsers.map(user => {
                    if(user.username === senderId){
                        return {
                            ...user,
                            requestReceived: false
                        }
                    }
                    return user;
                })
            })
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

    const cancelRequest = (requestId: string, receiverId: string) => {

        axios.post(`/api/user/friendRequests/cancel/${requestId}`)
        .then(res => {
            // remove request from requestsSent
            setRequestsSent(prevRequests => {
                return prevRequests.filter(request => request.requestId !== requestId)
            })

            // update users.requestsReceived
            setUsers(prevUsers => {
                return prevUsers.map(user => {
                    if(user.username === receiverId){
                        return {
                            ...user,
                            requestSent: false
                        }
                    }
                    return user;
                })
            })
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

            <h1>Find out if you are friends with others</h1>

            {users.length > 0 && 
                users.map(user => {
                    return (
                        <div key={user.username}>
                            <span>{user.username} </span>
                            {user.friends ?
                                <button disabled>
                                    Friends Already
                                </button>
                                :
                                user.requestSent ?
                                    <button disabled>
                                        Request sent
                                    </button>
                                    :
                                    user.requestReceived ?
                                        <button disabled>
                                            Request received
                                        </button>
                                        :
                                        <button onClick={ () => submitData(user.username)}>
                                            Send Request
                                        </button>
                            }
                            <br /><br />
                        </div>
                    )
                })
            }

            <h1>Requests received</h1>

            {requestsReceived.length > 0 ? 
                requestsReceived.map(request => {
                    return (
                        <div key={request.requestId}>
                            {`Request ID: ${request.requestId} sent by ${request.senderId} at ${request.createdAt}`}
                            <button onClick={() => acceptRequest(request.requestId, username, request.senderId)}>
                                Accept
                            </button>
                            <button onClick={() => rejectRequest(request.requestId, username, request.senderId)}>
                                Reject
                            </button>
                        </div>
                    )
                })
                :
                <div>
                    No requests received
                </div>
            }

            <h1>Requests sent</h1>

            {requestsSent.length > 0 ?
                requestsSent.map(request => {
                    return (
                        <div key={request.requestId}>
                            {`Request ID: ${request.requestId} sent to ${request.receiverId} at ${request.updatedAt}`}
                            {/* Add a cancel button */}
                            <button onClick={() => cancelRequest(request.requestId, request.receiverId) }>
                                Cancel
                            </button>
                        </div>
                    )
                })
                :
                <div>
                    No requests sent
                </div>
            }

        </div>
    )
}