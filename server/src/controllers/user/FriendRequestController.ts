import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { convertToAMPM } from "../../utils/helperFunctions";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { FriendRequestInterface, FriendRequestModel } from "../../models/FriendRequest";

@Controller("friendRequests")
export class FriendRequestController {
    
    @Get("")
    @Middleware([isLoggedIn])
    public async getUserFriendRequestsReceived(req: Request, res: Response): Promise<Response> {

        const username = req.session?.username;

        try{
            const friendRequestsFound: FriendRequestInterface[] = await FriendRequestModel.getUserFriendRequestsReceived(username) as FriendRequestInterface[];

            if(friendRequestsFound.length === 0) {
                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Friends not found. Please log in again.",
                    code: "UFC001"
                });

            }

            const requests = friendRequestsFound.map( request => {
                return {
                    requestId: request.REQUEST_ID,
                    senderId: request.SENDER_ID,
                    createdAt: convertToAMPM(new Date(request.CREATED_AT))  // setting time to AM/PM
                }
            })

            return res.status(STATUS.OK).json(requests);

        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    // fetch requests sent by user
    // send/create friend requests
    // remove sent friend request
    // accept friend request - pass request id
    

}