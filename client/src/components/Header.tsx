import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { Link } from "react-router-dom";

export const Header:FunctionComponent = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

    useEffect(() => {
        axios.get("/api/user/profile")
        .then(res => {
            setIsLoggedIn(true);
    
        })
        .catch(e => {
            setIsLoggedIn(false)
        })
    },[])

    const logOutClicked = () => {
        axios.get("/api/help/logout")
        .then(res => {
            setIsLoggedIn(false);
            window.location.pathname = "/login";
        })
        .catch(e => {
            const error = e.response;
            console.log(error.data);
            setIsLoggedIn(true);
        })
    }
    
    return ( 
        <>
        <div>Header</div>
        { isLoggedIn ? 
            <>{"YOU ARE LOGGED IN"} <button onClick={logOutClicked}>Log Out</button></> 
            : <>{"YOU ARE LOGGED OUT"} <Link to="/login">Go to Log In</Link></>}<br/><br/>
        </>
    )
}