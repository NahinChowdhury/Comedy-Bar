import React, {FunctionComponent} from "react";
import { Link } from "react-router-dom";


export const Footer:FunctionComponent = () => {
    return ( 
        <>
            <div>Footer</div><br/><br/>
            <Link to="/login">Go to Log In</Link><br/>
            <Link to="/signup">Go to Sign up</Link><br/>
            <Link to="/profile">Go to Profile</Link><br/>
            <Link to="/">Go to Main Page</Link><br/>
            <Link to="/hello">Go to Hello</Link><br/>
        </>
    )
}