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
    showReplies: boolean;
}

export const ReplySection:FunctionComponent<any> = ({postId="", commentId="", setFetch, showReplies=false}) => {

    // topComment means if the comment is a direct child of a post
    // showComments is used to toggle if we want to see the comment section
    // children is the children of comments. It is empty if 

    const [replies, setReplies] = useState<CommentInterface[]>([]);
    const [displayCreateModal, setDisplayCreateModal] = useState<boolean>(false);
    const [displayReplies, setDisplayReplies] = useState<boolean>(false);
    const [displayReplyCreateModal, setDisplayReplyCreateModal] = useState<boolean>(false);
    const [fetchReplies, setFetchReplies] = useState<boolean>(true);

    const username = window.localStorage.getItem('user');

    useEffect(() => {

        if(fetchReplies === false) return;

        axios.get(`/api/global/posts/${postId}/comments/${commentId}`)
        .then(res => {
            const { commentReplies } = res.data;

            console.log('commentReplies');
            console.log(commentReplies);
            setReplies(() => {
                return commentReplies.map((reply:CommentInterface) => {
                    return {
                        ...reply,
                        showChildren: false
                    }
                })
            });

        })
        .catch(e => {
            console.log("Error: " + e.response)
            const error = e.response.data;
            console.log(e);
            console.log(error)
            setReplies([])
            switch(e.response.status){
                case 401:
                    console.log("error 401")
                    break;
                default:
                    // alert(`${error.message}. CODE: ${error.code}`);
            }
        })

        setFetchReplies(false);
    },[fetchReplies])
    
    const deleteReply = (postId: string, commentId: string) => {
        axios.delete(`/api/global/posts/${postId}/comments/${commentId}`)
        .then(res => {
            setFetchReplies(true);
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

    // It will have buttons showReplies
    return(
        <>
        <div className="replies" style={{marginLeft:"5rem"}}> 
            
            {<h4>Replies for commentId: [{commentId}]</h4>}
            
            <button type="button" onClick={ () => {
                setDisplayReplyCreateModal(prevDisplayReplyCreateModal => !prevDisplayReplyCreateModal);
            }}>
                {displayReplyCreateModal ? "Hide" : "Show" } Create Reply
            </button>
            {displayReplyCreateModal && <CreateOrEditComment 
                postId={postId}
                parentCommentId={commentId}
                setFetchComments={setFetchReplies}
                editMode={false}
            />}
            <br /><br /><br />
            {replies.length > 0 && commentId !== '41' ?                
                replies.map(reply => {
                    return (
                        <div key={reply.commentId}>
                            <div>Reply CommentID: {reply.commentId}</div>
                            <div>Reply Details: {reply.details}</div>
                            <div>Reply Commented By: {reply.commentedBy}</div>
                            <div>Reply Updated last: {reply.updatedAt}</div>
                            {reply.commentedBy === username &&
                                <>
                                    <button type="button" onClick={ () => {
                                        setReplies(prevReplies => {
                                            return prevReplies.map(currReply => {
                                                if(currReply.commentId === reply.commentId) {
                                                    return{
                                                        ...currReply,
                                                        displayEditModal: !currReply.displayEditModal
                                                    }
                                                }else{
                                                    return currReply
                                                }
                                            })
                                        })
                                    }}>
                                        {reply.displayEditModal ? "Cancel" : "" } Edit
                                    </button>
                                    <button type="button" onClick={() => deleteReply(reply.postId, reply.commentId)}>
                                        Delete
                                    </button>
                                    {reply.displayEditModal && <CreateOrEditComment 
                                        postId={postId}
                                        commentId={reply.commentId}
                                        details={reply.details}
                                        setFetchComments={setFetchReplies}
                                        editMode={true}
                                    />}
                                </>
                            }
                            {
                                <button type="button" onClick={ () => {
                                    setReplies(prevReplies => {
                                        return prevReplies.map(currReplies => {
                                            if(currReplies.commentId === reply.commentId) {
                                                return{
                                                    ...currReplies,
                                                    showReplies: !currReplies.showReplies
                                                }
                                            }else{
                                                return currReplies
                                            }
                                        })
                                    })
                                }}>
                                    {reply.showReplies ? "Hide" : "Show" } Replies
                                </button>
                            }
                            { reply.showReplies &&
                                <ReplySection
                                    postId={postId}
                                    commentId={reply.commentId}
                                    setFetch={setFetchReplies}
                                    showReplies={reply.showReplies}
                                />
                            }
                            <br /><br />
                        </div>
                    )
                })
                :
                "No replies to show"
            }
        </div>
        </>
    )
}