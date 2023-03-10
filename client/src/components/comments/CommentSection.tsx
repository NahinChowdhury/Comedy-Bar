import axios from "axios";
import React, {FunctionComponent, useEffect, useState} from "react";
import { CreateOrEditComment } from "./CreateOrEditComment";
import { ReplySection } from "./ReplySection";

interface CommentInterface {
    postId: string;
    commentId: string;
    commentedBy: string;
    details: string;
    updatedAt: string;
    displayEditModal: boolean;
    showReplies: boolean;
}

export const CommentSection:FunctionComponent<any> = ({postId="", showComments=false}) => {

    // topComment means if the comment is a direct child of a post
    // showComments is used to toggle if we want to see the comment section
    // children is the children of comments. It is empty if 

    const [comments, setComments] = useState<CommentInterface[]>([]);
    const [displayCreateModal, setDisplayCreateModal] = useState<boolean>(false);
    const [displayReplyCreateModal, setDisplayReplyCreateModal] = useState<boolean>(false);
    const [fetchComments, setFetchComments] = useState<boolean>(true);

    const username = window.localStorage.getItem('user');

    useEffect(() => {
        if(fetchComments === false) return;

        axios.get(`/api/global/posts/${postId}/comments`)
        .then(res => {
            const { postComments } = res.data;

            console.log('postComments');
            console.log(postComments);
            setComments(postComments);

        })
        .catch(e => {
            console.log("Error: " + e.response)
            const error = e.response.data;
            console.log(e);
            console.log(error)
            setComments([]);
            switch(e.response.status){
                case 401:
                    console.log("error 401")
                    break;
                default:
                    // alert(`${error.message}. CODE: ${error.code}`);
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
        <div className="comments" style={{marginLeft:"5rem"}}>
            
            {<h3>Comments for postID: [{postId}]</h3>}

            <button type="button" onClick={ () => {
                setDisplayCreateModal(prevDisplayCreateModal => !prevDisplayCreateModal);
            }}>
                {displayCreateModal ? "Hide" : "Show" } Create Comment
            </button>
            {displayCreateModal && <CreateOrEditComment 
                postId={postId}
                setFetchComments={setFetchComments}
                editMode={false}
            />}
            <br/><br/><br/>
            {comments.length > 0 ? 
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
                                {comment.displayEditModal ? "Cancel" : "" } Edit
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
                        {
                            <button type="button" onClick={ () => {
                                setComments(prevComments => {
                                    return prevComments.map(currComment => {
                                        if(currComment.commentId === comment.commentId) {
                                            return{
                                                ...currComment,
                                                showReplies: !currComment.showReplies
                                            }
                                        }else{
                                            return currComment
                                        }
                                    })
                                })
                            }}>
                                {comment.showReplies ? "Hide" : "Show" } Replies
                            </button>
                        }
                        { comment.showReplies &&
                            // I am passing down the commentId to Reply
                            // I have no idea if my comment has any replies
                            <ReplySection
                                postId={postId}
                                commentId={comment.commentId}
                                setFetch={setFetchComments}
                                showReplies={comment.showReplies}
                            />
                        }
                        {/* <button type="button" onClick={ () => {
                            setDisplayReplyCreateModal(prevDisplayReplyCreateModal => !prevDisplayReplyCreateModal);
                        }}>
                            {displayReplyCreateModal ? "Hide" : "Create" } Reply
                        </button>
                        {comment.children.length > 0 ?
                            <>
                                <button type="button" onClick={ () => {
                                    setComments(prevComments => {
                                        return prevComments.map(currComment => {
                                            if(currComment.commentId === comment.commentId){
                                                return{
                                                    ...currComment,
                                                    showComments: !currComment.showComments
                                                }
                                            }else{
                                                return currComment
                                            }
                                        })
                                    })
                                }}>
                                    {comment.showComments ? "Hide Replies" : "Show Replies" }
                                </button>
                            </>
                            :
                            <></>
                        }
                        {displayReplyCreateModal && <CreateOrEditComment 
                            postId={postId}
                            parentCommentId={comment.commentId}
                            setFetchComments={setFetchComments}
                            editMode={false}
                        />} */}
                        <br/><br/>

                        {/* {comment.children.length > 0
                            &&
                            comment.showComments &&
                                <CommentSection
                                    postId={postId}
                                    children={comment.children}
                                    commentId={comment.commentId}
                                    // showChildren={comment.showChildren}
                                    showComments={true}
                                />
                        } */}
                        <hr></hr>
                        <br/><br/>
                    </div>)
                })
                :
                "No comments to show"
            }
        </div>
        
    )
}