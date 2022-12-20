import axios from "axios";
import React, {FunctionComponent, useState} from "react";

interface PostInterface {
    postId: string;
    title: string;
    details: string;
    updatedAt: string;
}

export const CreateOrEditPost:FunctionComponent<PostInterface> = ({postId, title, details, updatedAt}) => {

    const originalFormData: PostInterface = {
        postId: postId,
        title: title,
        details: details,
        updatedAt: updatedAt
    };
    
    const [formData, setFormData] = useState<PostInterface>({
        postId: postId,
        title: title,
        details: details,
        updatedAt: updatedAt
    })

    const hasChanges = () => {
        const originalData = `${originalFormData.title} ${originalFormData.details}`;
        const newData = `${formData.title} ${formData.details}`;

        return originalData !== newData;
    }


    const submitData = () => {
        
        if(!hasChanges()){
            alert("Need to make a change to update the post.");
            return;
        }

        // change to put and send req to backend /posts
        axios.put(`/api/user/posts/${formData.postId}`, formData)
            .then(res => {
                // reload to see the updated post
                window.location.reload();
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
        <div className="profile">
            
            PostID: [{formData.postId}] <br/><br/>

            <div>
                {"Title:  "}
                <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={e => {
                        setFormData(prevFormData => {
                            return {
                                ...prevFormData,
                                title: e.target.value
                            }
                        }
                    )}
                }/>
            </div>
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
            <button onClick={submitData}>Submit</button>
        </div>
        
    )
}