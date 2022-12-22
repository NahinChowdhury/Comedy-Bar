import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { PostModel } from "../../models/Post";

interface PostInterface {
    POST_ID?: string;
    USERNAME?: string;
    TITLE?: string;
    DETAILS?: string;
    UPDATED_AT?: Date;
    CREATED_AT?: Date;
}

@Controller("posts")
export class GlobalPostController {
    
    @Get("")
    @Middleware([isLoggedIn])
    public async getGlobalPosts(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        const postsFound: PostInterface[] = await PostModel.getUserPost(username) as PostInterface[];

        if(postsFound.length === 0) {
            return res.status(STATUS.NOT_FOUND).json({
                message: "User has no posts.",
                code: "UC006"
            });
        }

        const userPosts = postsFound.map( post => {

            return {
                postId: post.POST_ID,
                title: post.TITLE,
                details: post.DETAILS,
                updatedAt: new Date(post.UPDATED_AT).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                    })  // setting time to AM/PM
            }
        })


        return res.status(STATUS.OK).json({userPosts: userPosts});
    }
}