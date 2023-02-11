import axios from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";

interface UserInterface {
    username: string;
}

interface RequestInterface {
    requestId: string,
    senderId: string,
    createdAt: string
}

export const Friends:FunctionComponent = () => {

    const [users, setUsers] = useState<UserInterface[]>([]);
    const [requestsReceived, setRequestsReceived] = useState<RequestInterface[]>([]);



    useEffect(() => { 
        axios.get('/api/global/user/getAllOtherUsers')
        .then(res => {
            const {allUsers} = res.data;

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
            setUsers([]);
            switch(e.response.status){
                case 401:
                    console.log("error 401")
                    break;
                default:
                    // alert(`${error.message}. CODE: ${error.code}`);
            }
        })
    },[])

    const submitData = (username: string) => {

        axios.post("/api/user/friendRequests/send", {receiverId: username})
            .then(res => {
                // const {firstname, lastname} = res.data;
                // console.log(res.data)
                // setFormData(prevFormData => {
                //     return {
                //         ...prevFormData,
                //         firstname: firstname,
                //         lastname: lastname,
                //     }
                // });

                alert("Success");
                // window.location.reload();
            })
            .catch(err => {
                const error = err.response;
                console.log(error.data);
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
                            <button onClick={ () => submitData(user.username)}>
                                Send Request
                            </button>
                            <br /><br />
                        </div>
                    )
                })
            }

            <h1>Requests received</h1>

            {requestsReceived.length > 0 && 
                requestsReceived.map(request => {
                    return (
                        <div key={request.requestId}>
                            {`Request ID: ${request.requestId} sent by ${request.senderId} at ${request.createdAt}`}
                        </div>
                    )
                })
            }

        </div>
    )
}