import axios from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";
import { Link } from "react-router-dom";


export const Profile:FunctionComponent = () => {

    const [username, setUsername] = useState<string>("");
    const [firstname, setFirstname] = useState<string>("");
    const [lastname, setLastname] = useState<string>("");



    useEffect(() => {
        axios.get("/api/user/profile")
        .then(res => {
            const {username, firstname, lastname} = res.data;

            setUsername(username);
            setFirstname(firstname);
            setLastname(lastname);
        })
        .catch(e => {
            const error = e.response.data;
            console.log(e);
            switch(e.response.status){
                case 401:
                    console.log("error 401")
                    break;
                default:
                    alert(`${error.message}. CODE: ${error.code}`);
            }


        })
    },[])

    return ( 
        <div className="signup">
            
            Hi {username}, Your first name is {`[${firstname}]`} and last name is {`[${lastname}]`}
            <div>Have an account? Log In!</div>
            <Link to="/login">Go to Log In</Link>
        </div>
        
    )
}