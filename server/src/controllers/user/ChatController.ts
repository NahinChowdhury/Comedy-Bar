import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes as STATUS}  from "http-status-codes";
import { convertToAMPM } from "../../utils/helperFunctions";
import { isLoggedIn } from "../../middlewares/LoggedIn";
import { ChatMessageInterface, ChatModel, ChatRoomInterface } from "../../models/Chat";

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
                            code: "UCC001"
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

    @Get(":chatId/hasAccess")
    @Middleware([isLoggedIn])
    public async userHasAccess(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {chatId} = req.params;
        console.log('chatId')
        console.log(chatId)

        try{
            const chatRoomFound: ChatRoomInterface = await ChatModel.checkUserHasAccess(username, chatId) as ChatRoomInterface;
            
            if(chatRoomFound === null) {

                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "User does not have access to this chat.",
                    code: "UCC002"
                });

            }


            console.log("chatRoomFound")
            console.log(chatRoomFound)
            const hasAccess = {
                hasAccess: true
            }


            return res.status(STATUS.OK).json({hasAccess: hasAccess});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
    
    @Get(":chatId/getMessages")
    @Middleware([isLoggedIn])
    public async getMessage(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {chatId} = req.params;
        console.log('get chatId')
        console.log(chatId)

        try{
            // making sure user has permission to send messages to the chat
            const messagesFound: ChatMessageInterface[] = await ChatModel.getMessages(username, chatId) as ChatMessageInterface[];
             
            if(messagesFound.length === 0) {
                return res.status(STATUS.OK).json({messages: messagesFound});
            }
            
            console.log("messagesFound");
            console.log(messagesFound);

            const messages = messagesFound.map( message => {
                return {
                    messageId: message.MESSAGE_ID,
                    sender: message.SENDER,
                    details: message.DETAILS,
                    read: message.READ,
                    updatedAt: convertToAMPM( new Date(message.UPDATED_AT))
                }
            })

            console.log('get messages');
            console.log(messages);

            return res.status(STATUS.OK).json({messages: messages});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }

    @Post(":chatId/createMessage")
    @Middleware([isLoggedIn])
    public async createMessage(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {chatId} = req.params;
        const {details} = req.body;
        console.log('chatId')
        console.log(chatId)

        try{
            // making sure user has permission to send messages to the chat
            const messageCreated: ChatMessageInterface = await ChatModel.createMessage(username, chatId, details) as ChatMessageInterface;
            
            if(messageCreated === null) {

                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Message could not be sent. Please try again.",
                    code: "UCC003"
                });
            }

            console.log("messageCreated");
            console.log(messageCreated);

            const messageCreatedRes = {
                messageId: messageCreated.MESSAGE_ID,
                sender: messageCreated.SENDER,
                details: messageCreated.DETAILS,
                read: messageCreated.READ,
                updatedAt: convertToAMPM( new Date(messageCreated.UPDATED_AT))
            }

            return res.status(STATUS.OK).json({messageCreated: messageCreatedRes});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
    
    @Post(":chatId/deleteMessage")
    @Middleware([isLoggedIn])
    public async deleteMessage(req: Request, res: Response): Promise<Response> {
        
        const username = req.session?.username;
        const {chatId} = req.params;
        const {messageId} = req.body;
        console.log('chatId')
        console.log(chatId)

        try{
            // making sure user has permission to send messages to the chat
            const messageDeleted: ChatMessageInterface = await ChatModel.deleteMessage(username, chatId, messageId) as ChatMessageInterface;
            
            if(messageDeleted === null) {

                return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                    message: "Message could not be deleted. Please try again.",
                    code: "UCC004"
                });
            }

            console.log("messageDeleted");
            console.log(messageDeleted);

            const messageDeletedRes = {
                messageId: messageDeleted.MESSAGE_ID,
                sender: messageDeleted.SENDER,
                details: messageDeleted.DETAILS,
                read: messageDeleted.READ,
                updatedAt: convertToAMPM( new Date(messageDeleted.UPDATED_AT))
            }

            return res.status(STATUS.OK).json({messageDeleted: messageDeletedRes});
            
        }catch(e){
            return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                message: e.message,
                code: e.code
            });
        }
    }
}