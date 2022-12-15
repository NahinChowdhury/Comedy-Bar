import axios from "axios";
import React, {FunctionComponent, useState} from "react";
import { Link } from "react-router-dom";


export const Main:FunctionComponent = () => {

    const [userInput, setUserInput] = useState<string>("");
    const [gotResponse, setGotResponse] = useState<boolean>(false)
    const [serverResponse, setServerResponse] = useState<String>("")

    const submitClicked = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        
        // axios.post('/api/tweetCentral/tweet/isTweetGood', {input: userInput})
        axios.get('/api/tweetCentral/tweet/isTweetGood')
            .then(response => {
                console.log(response.data)
                setGotResponse(true)
                setServerResponse(JSON.stringify(response.data))
            })
            .catch(error => {
                setGotResponse(false)
            })
            
            
        // axios.get('/isTweetGood')
        // .then(response => {
        //     setGotResponse(response.data)
        // })
        // .catch(error => {
        //     setGotResponse(false)
        // })

    }



    return ( 
        <div className="main-content">
            <div>Welcome to Is my tweet a banger?</div>
            <input 
                type="text" 
                value={userInput} 
                onChange={e => {
                    setUserInput(e.target.value)
                }}
            />
            <button onClick={submitClicked}>Submit</button>
            {gotResponse && <h1>BANGER DETECTED!!!!</h1>}
            {serverResponse}
            <Link to="/login">Go to Login</Link>
        </div>
    )
}