import axios from "axios";
import React, {FunctionComponent, useState} from "react";

interface CommentInterface {
    postId: string;
    details: string;
    commentId: string;
    parentCommentId: string;
}

export const CreateOrEditComment:FunctionComponent<any> = ({postId="", commentId="", parentCommentId="", details="", setFetchComments, editMode}) => {
    // parentCommentId will be empty string when we are creating a comment for a post. Otherwise we are creating a reply of a reply

    const emptyFormData: CommentInterface = {
        postId: postId,
        details: details,
        commentId: commentId,
        parentCommentId: parentCommentId
    };

    const originalFormData: CommentInterface = {
        postId: postId,
        details: "",
        commentId: commentId,
        parentCommentId: parentCommentId
    };
    const [formData, setFormData] = useState<CommentInterface>(emptyFormData)

    const hasChanges = () => {
        const originalData = `${originalFormData.details}`;
        const newData = `${formData.details}`;

        return originalData !== newData;
    }

    const submitData = () => {
        
        if(!editMode){
            if(formData.details === "" ){
                alert("Please add a title or detail to create post");
                return;
            }
        }

        if(editMode && !hasChanges()){
            alert("Need to make a change to update the comment.");
            return;
        }

        if(editMode){
            axios.put(`/api/global/posts/${postId}/comments`, formData)
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
        }else{
            console.log("Sending for creating reply");
            console.log(formData)
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
    }
    
    return ( 
        <div className="create-comment">
            <div>
                {parentCommentId === "" ?  "Comment" : "Reply"} Details:
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
            <button onClick={submitData}>{editMode? "Edit":"Create"} Comment</button>
        </div>
        
    )
}