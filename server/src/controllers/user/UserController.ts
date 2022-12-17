import { Controller, ClassOptions, ChildControllers, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { ProfileModel } from "../../models/Profile";

// import * as controllers from './Index';

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

        interface ProfileInterface {
            USERNAME?: string;
            FIRSTNAME?: string;
            LASTNAME?: string;
        }

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
}