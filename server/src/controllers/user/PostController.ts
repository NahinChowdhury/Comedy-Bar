import { Controller, Get, Post, Put, Delete } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
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
export class PostController {
    
    @Get("")
    public async getUserPosts(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        if(!username) return res.status(STATUS.UNAUTHORIZED).json({
            message: "User cannot be identified. Please log in again.",
            code: "UC005"
        });

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

    @Put(":id")
    public async updateUserPost(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;
        const {id} = req.params;
        const {title, details} = req.body;

        if(!username) return res.status(STATUS.UNAUTHORIZED).json({
            message: "User cannot be identified. Please log in again.",
            code: "UC007"
        });

        const postCreated: PostInterface = await PostModel.updateUserPost(username, id, title, details) as PostInterface;

        if(postCreated === null) {
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Post could not be updated. Please try again.",
                code: "UC008"
            });

        }

        return res.status(STATUS.OK).json({message: "Post has been updated."});
    }
    
    @Post("")
    public async createUserPost(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;
        const {title, details} = req.body;

        if(!username) return res.status(STATUS.UNAUTHORIZED).json({
            message: "User cannot be identified. Please log in again.",
            code: "UC009"
        });

        const postCreated: PostInterface = await PostModel.createUserPost(username, title, details) as PostInterface;

        if(postCreated === null) {
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Post could not be created. Please try again.",
                code: "UC010"
            });

        }

        return res.status(STATUS.OK).json({message: "Post has been created."});
    }

    @Delete(":id")
    public async deleteUserPost(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;
        const {id} = req.params;

        if(!username) return res.status(STATUS.UNAUTHORIZED).json({
            message: "User cannot be identified. Please log in again.",
            code: "UC011"
        });

        const postDeleted: PostInterface = await PostModel.deleteUserPost(username, id) as PostInterface;

        if(postDeleted === null) {
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Post could not be deleted. Please try again.",
                code: "UC012"
            });

        }

        return res.status(STATUS.OK).json({message: "Post has been deleted."});
    }
}