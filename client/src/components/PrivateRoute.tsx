import React, {Component, FunctionComponent, useEffect, useState} from "react";
import { Route, Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';


export const PrivateRoute= () => {

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

    useEffect(() => {
        axios.get("/api/help/isLoggedIn")
            .then(response => {
                setIsLoggedIn(true);
            })
            .catch(error => {
                setIsLoggedIn(false);
            })
    },[]);

    const renderComponent = () => {
        if(isLoggedIn){
            return <Outlet />;
        }else{
            return <Navigate to="/NotFound" />;
        }
    }

    return renderComponent();
}