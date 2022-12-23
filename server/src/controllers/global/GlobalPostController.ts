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

        const commentsFound: CommentInterface[] = await CommentModel.getAllPostComment(postId) as CommentInterface[];

        if(commentsFound.length === 0) {
            return res.status(STATUS.NO_CONTENT).json({
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
        const { parentCommentId, details } = req.body;


        const commentCreated: CommentInterface = await CommentModel.createPostComment(postId, parentCommentId, username, details, ) as CommentInterface;

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

        const commentDeleted: CommentInterface = await CommentModel.deletePostComment(commentId, postId, username) as CommentInterface;

        if(commentDeleted === null) {
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Comment could not be deleted. Please try again.",
                code: "UPC004"
            });

        }
        
        return res.status(STATUS.OK).json({message: "Comment has been deleted."});
    }


    @Get(":postId/comments/all")
    @Middleware([isLoggedIn])
    public async getAllPostComments(req: Request, res: Response): Promise<Response> {
        const { postId } = req.params;

        // should I get all comments at first try
        // it is safe to request all and run recursion so that we don't overload database while creating the algorithm
        const commentsFound: CommentInterface[] = await CommentModel.getPostComment(postId) as CommentInterface[];
        // const commentsFound: CommentInterface[] = await CommentModel.getAllPostComment(postId) as CommentInterface[];

        if(commentsFound.length === 0) {
            return res.status(STATUS.NOT_FOUND).json({
                message: "This post has no comments.",
                code: "GPC005"
            });
        }
        // I get a list of comments who are direct children of post
        // I need to create an object now and for each comment, I need to request more comments whose parent_comment_id is my comment_id

        // end recursion when parent is null.
        const topLevelComments = commentsFound.filter(comment => comment.PARENT_COMMENT_ID === null);

        // console.log('topLevelComments');
        // console.log(topLevelComments);

        const postComments = topLevelComments.map( comment => {
            return {
                commentId: comment.COMMENT_ID,
                postId: comment.POST_ID,
                commentedBy: comment.COMMENTED_BY,
                details: comment.DETAILS,
                updatedAt: convertToAMPM(new Date(comment.UPDATED_AT)),  // setting time to AM/PM
                children: getChildrenComments(comment.COMMENT_ID)
                // children: getChildrenComments(comment.POST_ID, comment.COMMENT_ID, commentsFound)
            }
        })

        // console.log("FINAL postComments")
        // console.log(JSON.stringify(postComments))

        // return res.status(STATUS.OK).json({postComments: "postComments"});
        return res.status(STATUS.OK).json({postComments: postComments});
    }
    
    @Get(":postId/comments/:commentId")
    @Middleware([isLoggedIn])
    public async getAllCommentReplies(req: Request, res: Response): Promise<Response> {
        const { postId, commentId } = req.params;

        console.log("GOT REQUEST FOR: " + commentId);
        // should I get all comments at first try
        // it is safe to request all and run recursion so that we don't overload database while creating the algorithm
        const repliesFound: CommentInterface[] = await CommentModel.getCommentReplies(commentId) as CommentInterface[];
        // const commentsFound: CommentInterface[] = await CommentModel.getAllPostComment(postId) as CommentInterface[];

        if(repliesFound.length === 0) {
            return res.status(STATUS.NOT_FOUND).json({
                message: "This comments has no replies.",
                code: "GPC006"
            });
        }
        // I get a list of comments who are direct children of post
        // I need to create an object now and for each comment, I need to request more comments whose parent_comment_id is my comment_id

        // end recursion when parent is null.
        // const topLevelReplies = repliesFound.filter(reply => reply.PARENT_COMMENT_ID === commentId);

        // console.log('topLevelComments');
        // console.log(topLevelComments);

        const commentReplies = await Promise.all( // need promise because await doesnt work on map function
            repliesFound.map( async (reply) => {
                return {
                    commentId: reply.COMMENT_ID,
                    postId: reply.POST_ID,
                    commentedBy: reply.COMMENTED_BY,
                    details: reply.DETAILS,
                    updatedAt: convertToAMPM(new Date(reply.UPDATED_AT)),  // setting time to AM/PM
                    children: await getChildrenComments(reply.COMMENT_ID)
                }
            })
        )

        console.log("FINAL postComments")
        console.log(JSON.stringify(commentReplies))

        // return res.status(STATUS.OK).json({postComments: "postComments"});
        return res.status(STATUS.OK).json({commentReplies: commentReplies});
    }
}


async function getChildrenComments(parentCommentId: string): Promise<any>{
    // I will treat commentsFound as the result we get from db
    // console.log("I am in getChildren function")
    // getting the comment with matching parentCommentId
    const commentsFound: CommentInterface[] = await CommentModel.getCommentReplies(parentCommentId) as CommentInterface[];

        console.log("Found matching children")
        console.log(commentsFound)

    if(commentsFound.length === 0){
        // console.log("RETURNING EMPTY STRING")
        return [];
    }

    return await commentsFound.map( async (comment) => {
        return {
            commentId: comment.COMMENT_ID,
            postId: comment.POST_ID,
            commentedBy: comment.COMMENTED_BY,
            details: comment.DETAILS,
            updatedAt: convertToAMPM(new Date(comment.UPDATED_AT)),  // setting time to AM/PM
            children: await getChildrenComments(comment.COMMENT_ID)
        }
    })
}