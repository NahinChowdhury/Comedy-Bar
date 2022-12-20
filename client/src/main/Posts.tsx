import axios from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";
import { CreateOrEditPost } from "../components/CreateOrEditPost";


export const Posts:FunctionComponent = () => {


    interface PostInterface {
        postId: string;
        title: string;
        details: string;
        updatedAt: string;
        displayModal: boolean;
    }

    const [posts, setPosts] = useState<PostInterface[]>([]);

    useEffect(() => { 
        axios.get('/api/user/posts')
        .then(res => {
            const { userPosts } = res.data;

            setPosts(userPosts);
            
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
    },[])


    return ( 
        <div className="posts">
            
            <h1>Posts:</h1>
            <br/>
            {posts.length > 0 && 
            posts.map(post => {
                return (<div key={post.postId}>
                    <div>PostID: {post.postId}</div>
                    <div>Title: {post.title}</div>
                    <div>Details: {post.details}</div>
                    <div>Updated last: {post.updatedAt}</div>
                    <button type="button" onClick={ () => {setPosts(prevPosts => {
                        return prevPosts.map(currPost => {
                            if(currPost.postId === post.postId){
                                return{
                                    ...currPost,
                                    displayModal: !currPost.displayModal
                                }
                            }else{
                                return currPost
                            }
                        })
                    })}}>{post.displayModal ? "Hide" : "Edit" }</button>
                    {post.displayModal && <CreateOrEditPost 
                        postId={post.postId} 
                        title={post.title}
                        details={post.details}
                        updatedAt={post.updatedAt}
                    />}
                    <br/><br/><br/>
                </div>)
            })}
        </div>
        
    )
}