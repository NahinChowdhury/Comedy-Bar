import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { ProfileModel } from "../../models/Profile";

interface ProfileInterface {
    USERNAME?: string;
    FIRSTNAME?: string;
    LASTNAME?: string;
}

@Controller("profile")
export class ProfileController {
    
    @Get("")
    @Middleware([isLoggedIn])
    public async getUserProfile(req: Request, res: Response): Promise<Response> {
        console.log('inside profile controller')

        const username = req.session?.username;

        const profileFound: ProfileInterface = await ProfileModel.getUserProfile(username) as ProfileInterface;

        if(profileFound === null) {
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Profile not found. Please log in again.",
                code: "UPRC001"
            });

        }

        const profile = {
            username: profileFound.USERNAME,
            firstname: profileFound.FIRSTNAME || "",
            lastname: profileFound.LASTNAME || "",
        }

        return res.status(STATUS.OK).json(profile);
    }

    @Put("")
    @Middleware([isLoggedIn])
    public async updateUserProfile(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;
        const {firstname, lastname} = req.body;

        const profileUpdated: ProfileInterface = await ProfileModel.updateUserProfile(username, firstname, lastname) as ProfileInterface;

        if(profileUpdated === null) {
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: "Profile could not be updated. Please log in again.",
                code: "UPRC002"
            });

        }

        const profile = {
            username: profileUpdated.USERNAME,
            firstname: profileUpdated.FIRSTNAME,
            lastname: profileUpdated.LASTNAME,
        }

        return res.status(STATUS.OK).json(profile);
    }
}