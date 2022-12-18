import axios from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";
import { Link } from "react-router-dom";


export const Profile:FunctionComponent = () => {

    interface ProfileInterface {
        firstname: string;
        lastname: string;
    }
    const [username, setUsername] = useState<string>("");
    const [formData, setFormData] = useState<ProfileInterface>({firstname:"", lastname:""});



    useEffect(() => {
        axios.get("/api/user/profile")
        .then(res => {
            const {username, firstname, lastname} = res.data;

            setUsername(username);
            setFormData(prevFormData => {
                return {
                    ...prevFormData,
                    firstname: firstname,
                    lastname: lastname,
                }
            });
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

    const submitData = () => {

        axios.post("/api/user/profile", formData)
            .then(res => {
                const {firstname, lastname} = res.data;

                setFormData(prevFormData => {
                    return {
                        ...prevFormData,
                        firstname: firstname,
                        lastname: lastname,
                    }
                });

                alert("Success");
            })
            .catch(err => {
                const error = err.response;
                console.log(error.data);
            })
    }
    return ( 
        <div className="profile">
            
            Hi Username: [{username}] <br/><br/>

            <div>
                {"Firstname:  "}
                <input 
                    type="text" 
                    name="firstname" 
                    value={formData.firstname} 
                    onChange={e => {
                        setFormData(prevFormData => {
                            return {
                                ...prevFormData,
                                firstname: e.target.value
                            }
                        }
                    )}
                }/>
            </div>
            <div>
                {"Lastname:  "}
                <input 
                    type="text" 
                    name="lastname" 
                    value={formData.lastname} 
                    onChange={e => {
                        setFormData(prevFormData => {
                            return {
                                ...prevFormData,
                                lastname: e.target.value
                            }
                        }
                    )}
                }/>
            </div>
            <br/>
            <button onClick={submitData}>Submit</button>

        </div>
        
    )
}