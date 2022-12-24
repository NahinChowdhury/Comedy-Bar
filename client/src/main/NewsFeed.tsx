import axios from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";
import { CommentSection } from "../components/comments/CommentSection";


export const NewsFeed:FunctionComponent = () => {


    interface PostInterface {
        postId: string;
        username: string;
        title: string;
        details: string;
        updatedAt: string;
        displayEditModal: boolean;
        showComments: boolean;
    }

    
    const [posts, setPosts] = useState<PostInterface[]>([]);

    useEffect(() => { 
        axios.get('/api/global/posts')
        .then(res => {
            const { globalPosts } = res.data;
            setPosts(globalPosts);
            
        })
        .catch(e => {

            const error = e.response.data;
            console.log(e);
            console.log(error);
            setPosts([]);
            switch(e.response.status){
                case 401:
                    console.log("error 401")
                    break;
                default:
                    alert(`${error.message}. CODE: ${error.code}`);
            }
        })
    },[])


    return ( 
        <div className="posts">
            
            <h1>Global Posts:</h1>
            
            {posts.length > 0 && 
            posts.map(post => {
                return (<div key={post.postId}>
                    <div>PostID: {post.postId}</div>
                    <div>Username: {post.username}</div>
                    <div>Title: {post.title}</div>
                    <div>Details: {post.details}</div>
                    <div>Updated last: {post.updatedAt}</div>
                    <button type="button" onClick={ () => {setPosts(prevPosts => {
                        return prevPosts.map(currPost => {
                            if(currPost.postId === post.postId){
                                return{
                                    ...currPost,
                                    showComments: !currPost.showComments
                                }
                            }else{
                                return currPost
                            }
                        })
                    })}}>
                        {post.showComments ? "Hide Comments" : "Show Comments" }
                    </button>
                    {post.showComments && 
                    <div>
                        <CommentSection
                            postId={post.postId}
                            showComments={post.showComments}
                            />
                    </div>
                    }
                    <hr></hr>
                    <br/><br/><br/>
                </div>)
            })}
        </div>
        
    )
}