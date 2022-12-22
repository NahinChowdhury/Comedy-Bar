import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { CreateOrEditComment } from "./CreateOrEditComment";

interface CommentInterface {
    postId: string;
    commentId: string;
    commentedBy: string;
    details: string;
    updatedAt: string;
    displayEditModal: boolean;
}

export const CommentSection:FunctionComponent<any> = ({postId="", showComments= false}) => {

    const [comments, setComments] = useState<CommentInterface[]>([]);
    const [displayCreateModal, setDisplayCreateModal] = useState<boolean>(false);
    const [fetchComments, setFetchComments] = useState<boolean>(true);

    const username = window.localStorage.getItem('user');

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
    
    const deleteComment = (postId: string, commentId: string) => {
        axios.delete(`/api/global/posts/${postId}/comments/${commentId}`)
        .then(res => {
            setFetchComments(true);
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
            {displayCreateModal && <CreateOrEditComment 
                postId={postId}
                setFetchComments={setFetchComments}
                editMode={false}
            />}
            <br/><br/><br/>
            {comments.length > 0 && 
            comments.map(comment => {
                return (<div key={comment.commentId}>
                    <div>CommentID: {comment.commentId}</div>
                    <div>Details: {comment.details}</div>
                    <div>Commented By: {comment.commentedBy}</div>
                    <div>Updated last: {comment.updatedAt}</div>
                    {comment.commentedBy === username &&
                    <>
                        <button type="button" onClick={ () => {
                            setComments(prevComments => {
                                return prevComments.map(currComment => {
                                    if(currComment.commentId === comment.commentId) {
                                        return{
                                            ...currComment,
                                            displayEditModal: !currComment.displayEditModal
                                        }
                                    }else{
                                        return currComment
                                    }
                                })
                            })
                        }}>
                            {comment.displayEditModal ? "Cancel" : "Edit" }
                        </button>
                        <button type="button" onClick={() => deleteComment(comment.postId, comment.commentId)}>
                            Delete
                        </button>
                        {comment.displayEditModal && <CreateOrEditComment 
                            postId={postId}
                            commentId={comment.commentId}
                            details={comment.details}
                            setFetchComments={setFetchComments}
                            editMode={true}
                        />}
                    </>
                    }
                    <hr></hr>
                    <br/><br/>
                </div>)
            })}
        </div>
        
    )
}