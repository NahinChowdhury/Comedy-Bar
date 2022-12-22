import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { CommentModel } from "../../models/Comment";
import { PostModel } from "../../models/Post";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { convertToAMPM } from "../../utils/helperFunctions";

interface PostInterface {
    POST_ID?: string;
    USERNAME?: string;
    TITLE?: string;
    DETAILS?: string;
    UPDATED_AT?: Date;
    CREATED_AT?: Date;
}

interface CommentInterface {
    COMMENT_ID?: string;
    POST_ID?: string;
    USERNAME?: string;
    DETAILS?: string;
    CREATED_AT?: Date;
    UPDATED_AT?: Date;
}
@Controller("posts")
export class GlobalPostController {
    
    @Get("")
    @Middleware([isLoggedIn])
    public async getGlobalPosts(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        const postsFound: PostInterface[] = await PostModel.getGlobalPosts(username) as PostInterface[];

        if(postsFound.length === 0) {
            return res.status(STATUS.NOT_FOUND).json({
                message: "User has no posts.",
                code: "GPC001"
            });
        }

        const globalPosts = postsFound.map( post => {

            return {
                postId: post.POST_ID,
                username: post.USERNAME,
                title: post.TITLE,
                details: post.DETAILS,
                updatedAt: convertToAMPM(new Date(post.UPDATED_AT))  // setting time to AM/PM
            }
        })


        return res.status(STATUS.OK).json({globalPosts: globalPosts});
    }

    @Get(":postId/comments")
    @Middleware([isLoggedIn])
    public async getPostComments(req: Request, res: Response): Promise<Response> {
        const { postId } = req.params;

        const commentsFound: CommentInterface[] = await CommentModel.getPostComment(postId) as CommentInterface[];

        if(commentsFound.length === 0) {
            return res.status(STATUS.NOT_FOUND).json({
                message: "This post has no comments.",
                code: "GPC002"
            });
        }

        const comments = commentsFound.map( comment => {

            return {
                commentId: comment.COMMENT_ID,
                postId: comment.POST_ID,
                username: comment.USERNAME,
                details: comment.DETAILS,
                updatedAt: convertToAMPM(new Date(comment.UPDATED_AT))  // setting time to AM/PM
            }
        })


        return res.status(STATUS.OK).json({comments: comments});
    }


}