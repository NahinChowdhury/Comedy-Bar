import axios from "axios";
import React, {FunctionComponent, useState} from "react";

interface CommentInterface {
    postId: string;
    details: string;
}

export const CreateComment:FunctionComponent<any> = ({postId="", setFetchComments}) => {

    const emptyFormData = {
        postId: postId,
        details: ""
    };

    const [formData, setFormData] = useState<CommentInterface>(emptyFormData)

    const submitData = () => {
        
        if(formData.details === "" ){
            alert("Please add a title or detail to create post");
            return;
        }

        axios.post(`/api/global/posts/${postId}/comments`, formData)
            .then(res => {
                // set FetchComments to true so that parent fetches the new comments and updates the comments for
                // this specific post
                setFetchComments(true);
                
                // setting formdata to empty
                setFormData(emptyFormData);
            })
            .catch(e => {
                const error = e.response.data;
                console.log(e);
                console.log(error)
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
        <div className="create-comment">
            <div>
                {"Details:  "}
                <input 
                    type="text" 
                    name="details" 
                    value={formData.details} 
                    onChange={e => {
                        setFormData(prevFormData => {
                            return {
                                ...prevFormData,
                                details: e.target.value
                            }
                        }
                    )}
                }/>
            </div>
            <br/>
            <button onClick={submitData}>Send Comment</button>
        </div>
        
    )
}