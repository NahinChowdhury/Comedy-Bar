import { Controller, ClassOptions, ChildControllers, Get, Post, Put } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { PostModel } from "../../models/Post";
import { ProfileModel } from "../../models/Profile";

// import * as controllers from './Index';


interface ProfileInterface {
    USERNAME?: string;
    FIRSTNAME?: string;
    LASTNAME?: string;
}

interface PostInterface {
    POST_ID?: string;
    USERNAME?: string;
    TITLE?: string;
    DETAILS?: string;
    UPDATED_AT?: Date;
    CREATED_AT?: Date;
}

// const ctrlList = [];

// for (const c in controllers) {
//     if(controllers.hasOwnProperty(c)) {
//         const ctrl = (controllers as any)[c];
//         ctrlList.push(new ctrl());
//     }
// }

@Controller("user") // all api class have to have api to work properly
@ClassOptions({ mergeParams: true })
// @ChildControllers(ctrlList)
export class UserApiController {

    
    @Get("profile")
    public async getUserProfile(req: Request, res: Response): Promise<Response> {
        console.log('inside profile controller')

        const username = req.session?.username;

        if(!username) return res.status(STATUS.UNAUTHORIZED).json({
            message: "Profile not found. Please log in again.",
            code: "UC001"
        });

        const profileFound: ProfileInterface = await ProfileModel.getUserProfile(username) as ProfileInterface;

        if(profileFound === null) {
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Profile not found. Please log in again.",
                code: "UC002"
            });

        }

        const profile = {
            username: profileFound.USERNAME,
            firstname: profileFound.FIRSTNAME,
            lastname: profileFound.LASTNAME,
        }

        return res.status(STATUS.OK).json(profile);
    }

    @Post("profile")
    public async updateUserProfile(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;
        const {firstname, lastname} = req.body;

        if(!username) return res.status(STATUS.UNAUTHORIZED).json({
            message: "Profile not found. Please log in again.",
            code: "UC003"
        });

        const profileUpdated: ProfileInterface = await ProfileModel.updateUserProfile(username, firstname, lastname) as ProfileInterface;

        if(profileUpdated === null) {
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Profile could not be updated. Please log in again.",
                code: "UC004"
            });

        }

        const profile = {
            username: profileUpdated.USERNAME,
            firstname: profileUpdated.FIRSTNAME,
            lastname: profileUpdated.LASTNAME,
        }

        return res.status(STATUS.OK).json(profile);
    }

    @Get("posts")
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

    @Put("posts/:id")
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

        return res.status(STATUS.OK).json({message: "Post has been created."});
    }
}