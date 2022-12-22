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
    COMMENTED_BY?: string;
    DETAILS?: string;
    CREATED_AT?: Date;
    UPDATED_AT?: Date;
    PARENT_COMMENT_ID?: string;
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

        const postComments = commentsFound.map( comment => {
            return {
                commentId: comment.COMMENT_ID,
                postId: comment.POST_ID,
                commentedBy: comment.COMMENTED_BY,
                details: comment.DETAILS,
                updatedAt: convertToAMPM(new Date(comment.UPDATED_AT))  // setting time to AM/PM
            }
        })


        return res.status(STATUS.OK).json({postComments: postComments});
    }

    @Post(":postId/comments")
    @Middleware([isLoggedIn])
    public async createPostComment(req: Request, res: Response): Promise<Response> {
        
        const { postId } = req.params;
        const username = req.session?.username;
        const { details } = req.body;

        const commentCreated: CommentInterface = await CommentModel.createPostComment(postId, username, details) as CommentInterface;

        if(commentCreated === null) {
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Comment could not be created. Please try again.",
                code: "UPC003"
            });

        }

        return res.status(STATUS.OK).json({message: "Comment has been created."});
    }

    @Put(":postId/comments")
    @Middleware([isLoggedIn])
    public async updatePostComment(req: Request, res: Response): Promise<Response> {
        
        const { postId } = req.params;
        const username = req.session?.username;
        const { commentId, details } = req.body;

        const commentUpdated: CommentInterface = await CommentModel.updatePostComment(commentId, postId, username, details) as CommentInterface;

        if(commentUpdated === null) {
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Comment could not be updated. Please try again.",
                code: "UPC004"
            });

        }

        return res.status(STATUS.OK).json({message: "Comment has been updated."});
    }

    @Delete(":postId/comments/:commentId")
    @Middleware([isLoggedIn])
    public async deleteUserPost(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;
        const { postId, commentId } = req.params;

        const commentUpdated: CommentInterface = await CommentModel.deletePostComment(commentId, postId, username) as CommentInterface;

        if(commentUpdated === null) {
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Comment could not be deleted. Please try again.",
                code: "UPC004"
            });

        }

        return res.status(STATUS.OK).json({message: "Comment has been deleted."});
    }
}