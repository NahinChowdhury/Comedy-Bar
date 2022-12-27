import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { convertToAMPM } from "../../utils/helperFunctions";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { PostModel, PostInterface } from "../../models/Post";
import { ChatModel, ChatRoomInterface } from "../../models/Chat";

@Controller("chat")
export class ChatController {
    
    @Post("findChat")
    @Middleware([isLoggedIn])
    public async findUserChat(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {otherMember} = req.body;
        console.log('otherMember')
        console.log(otherMember)

        try{
            const chatRoomFound: ChatRoomInterface = await ChatModel.findChatFromMembers(username, otherMember) as ChatRoomInterface;
            
            if(chatRoomFound === null) {

                // if chatRoom not found, then try catch with trying to create a room for them.
                try{
                    const chatRoomCreated: ChatRoomInterface = await ChatModel.createChatRoom(username, otherMember) as ChatRoomInterface;

                    if(chatRoomCreated === null) {
                        return res.status(STATUS.NOT_FOUND).json({
                            message: "Could not create a chat with User: " + otherMember,
                            code: "UPC001"
                        });
                    }

                    console.log("chatRoomCreated")
                    console.log(chatRoomCreated)

                    const chatRoom = { 
                        roomId: chatRoomCreated.ROOM_ID,
                        existed: false
                    }
                    
                    return res.status(STATUS.OK).json({chatRoom: chatRoom});
                    
                }catch(e){
                    throw new Error(e);
                }
            }


            console.log("chatRoomFound")
            console.log(chatRoomFound)
            const chatRoom = {
                roomId: chatRoomFound.ROOM_ID,
                existed: true
            }


            return res.status(STATUS.OK).json({chatRoom: chatRoom});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
}