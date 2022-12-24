import React, {FunctionComponent} from "react";
import { Link } from "react-router-dom";


export const Footer:FunctionComponent = () => {
    return ( 
        <>
            <br/>
            <hr/>
            <div style={{display:"flex", flexDirection:"row", justifyContent: "space-around", marginTop:"auto"}}>
                <Link to="/chat">Chat</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/login">Log In</Link>
                <Link to="/signup">Sign up</Link>
                <Link to="/newsFeed">News Feed</Link>
                <Link to="/hello">Hello</Link>
                <Link to="/posts">Posts</Link>
            </div>
            <br/>
            <br/>
        </>
    )
}