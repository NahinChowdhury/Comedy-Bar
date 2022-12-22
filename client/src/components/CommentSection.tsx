import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { CreateComment } from "./CreateComment";

interface CommentInterface {
    commentId: string;
    commentedBy: string;
    details: string;
    updatedAt: string;
}

export const CommentSection:FunctionComponent<any> = ({postId="", showComments= false}) => {

    const [comments, setComments] = useState<CommentInterface[]>([]);
    const [displayCreateModal, setDisplayCreateModal] = useState<boolean>(false);
    const [fetchComments, setFetchComments] = useState<boolean>(true);


    useEffect(() => { 

        if(fetchComments === false) return;

        axios.get(`/api/global/posts/${postId}/comments`)
        .then(res => {
            const { postComments } = res.data;
            setComments(postComments);         
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

        setFetchComments(false);
    },[fetchComments])
    
    return postId === "" ?
    (
    <>Unable to show comments for this post</>
    ):
    (
        showComments &&
        <div className="comments">
            
            <h3>Comments for postID: [{postId}]</h3>

            <button type="button" onClick={ () => {
                setDisplayCreateModal(prevDisplayCreateModal => !prevDisplayCreateModal);
            }}>
                {displayCreateModal ? "Hide" : "Create" }
            </button>
            {displayCreateModal && <CreateComment 
                postId={postId}
                setFetchComments={setFetchComments}
            />}
            <br/><br/><br/>
            {comments.length > 0 && 
            comments.map(comment => {
                return (<div key={comment.commentId}>
                    <div>CommentID: {comment.commentId}</div>
                    <div>Details: {comment.details}</div>
                    <div>Commented By: {comment.commentedBy}</div>
                    <div>Updated last: {comment.updatedAt}</div>
                    <hr></hr>
                    <br/><br/>
                </div>)
            })}
        </div>
        
    )
}