import axios, { CancelTokenSource } from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";


export const Posts:FunctionComponent = () => {


    interface PostInterface {
        postId: string;
        title: string;
        details: string;
        updatedAt: Date;
    }

    const [posts, setPosts] = useState<PostInterface[]>([]);

    useEffect(() => { 
        axios.get('/api/user/posts')
        .then(res => {
            const { userPosts } = res.data;

            setPosts(userPosts.map( (post:PostInterface) => {
                return {
                    ...post,
                    updatedAt: new Date(post.updatedAt)
                }
            }));
            
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

    // const submitData = () => {

    //     axios.post("/api/user/profile", formData)
    //         .then(res => {
    //             const {firstname, lastname} = res.data;

    //             setFormData(prevFormData => {
    //                 return {
    //                     ...prevFormData,
    //                     firstname: firstname,
    //                     lastname: lastname,
    //                 }
    //             });

    //             alert("Success");
    //         })
    //         .catch(err => {
    //             const error = err.response;
    //             console.log(error.data);
    //         })
    // }

    return ( 
        <div className="posts">
            
            Posts:
            <br/>
            {posts.length > 0 && 
            posts.map(post => {
                return (<div key={post.postId}>
                    <div>PostID: {post.postId}</div>
                    <div>Title: {post.title}</div>
                    <div>Details: {post.details}</div>
                    <div>Latest update date: {`${post.updatedAt.toLocaleString('default', { month: 'long' })} ${post.updatedAt.getDate()}, ${post.updatedAt.getFullYear()}`}</div>
                    <br/>
                </div>)
            })}
        </div>
        
    )
}