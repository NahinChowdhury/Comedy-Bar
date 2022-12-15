import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { client } from "../../models/index";
import { LoginModel } from "../../models/login";
import { StatusCodes as STATUS}  from "http-status-codes";


@Controller("")
export class UserController {
    @Post("login")
    public async login(req: Request, res: Response){
        const {username, password} = req.body;

        let result = {userExists: false};
        const userFound = await LoginModel.verifyUser(username, password);


        if(userFound?.PASSWORD === password) {
            result.userExists = true;
            return res.status(STATUS.OK).json(result);
        }

        return res.status(STATUS.NOT_FOUND).json({
            message: "Could not verify user. Please try again",
            code: 404
        })
    }
  
    @Post("signup")
    public async singup(req: Request, res: Response){

        const {username, password} = req.body;

        const userExists = await LoginModel.findUser(username);

        if(userExists !== null) {
            return res.status(STATUS.BAD_REQUEST).json({
                message: "A user with this username already exists. Please login",
                code: 404
            });
        }
        const userCreated = await LoginModel.createNewUser(username, password);

        if(userCreated === null){
            return res.status(STATUS.BAD_REQUEST).json({
                message: "Could not create user. Please try again",
                code: 404
            });
        }

        if( userCreated?.USERNAME == username && userCreated?.PASSWORD === password ){
            return res.status(STATUS.OK).json({username: userCreated?.USERNAME , password: userCreated?.PASSWORD});
        }

        return res.status(STATUS.CONFLICT).json({
            message: "A user was created but not with the credentials you requested. Please try to login before signing up again.",
            code: 409
        });

    }
}