import { client } from './index';
import { LoginModel, UserInterface } from './login';

export interface ChatMessageInterface {
    MESSAGE_ID?: string;
    ROOM_ID?: string;
    SENDER?: string;
    DETAILS?: string;
    READ?: boolean;
    CREATED_AT?: Date;
    UPDATED_AT?: Date;
    READ_AT?: Date;
}

export interface ChatRoomInterface {
    ROOM_ID?: string;
    MEMBER_ONE?: string;
    MEMBER_TWO?: string;
    STATUS?: string;
    CREATED_BY?: string;
    CREATED_AT?: Date;
}

export class ChatModel implements ChatMessageInterface, ChatRoomInterface {
    MESSAGE_ID?: string;
    ROOM_ID?: string;
    SENDER?: string;
    DETAILS?: string;
    READ?: boolean;
    CREATED_AT?: Date;
    UPDATED_AT?: Date;
    READ_AT?: Date;

    MEMBER_ONE?: string;
    MEMBER_TWO?: string;
    STATUS?: string;
    CREATED_BY?: string;

    constructor(user: ChatMessageInterface | ChatRoomInterface) {
        Object.assign(this, user);
    }

    static async createChatRoom(memberOne: string, memberTwo: string): Promise<ChatRoomInterface | null> {

        // memberOne is the user themselves
        // memberTwo is the other person our user wants to chat to

        // making sure user does exist before fetching all other users
        const [memberOneExists, memberTwoExists] = await Promise.all([LoginModel.findUser(memberOne), LoginModel.findUser(memberTwo)]);
        if(memberOneExists === null){
            return new Promise<ChatRoomInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "Please log in and try again.",
                        code:"CM001"
                    })
            })
        }
        
        if(memberTwoExists === null){
            return new Promise<ChatRoomInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "The user you are trying to chat to doesn't exist anymore. Please reload the page and try again.",
                        code:"CM002"
                    })
            })
        }

        const query = `INSERT INTO public."SingleChatRoom" ("MEMBER_ONE", "MEMBER_TWO", "CREATED_BY") VALUES ($1, $2, $3) returning *;`
        const params = [memberOne, memberTwo, memberOne];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new ChatModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

    static async findChatFromMembers(memberOne: string, memberTwo: string): Promise<ChatRoomInterface | null> {

        // memberOne is the user themselves
        // memberTwo is the other person our user wants to chat to

        // making sure user does exist before fetching all other users
        const [memberOneExists, memberTwoExists] = await Promise.all([LoginModel.findUser(memberOne), LoginModel.findUser(memberTwo)]);
        if(memberOneExists === null){
            return new Promise<ChatRoomInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "Please log in and try again.",
                        code:"CM001"
                    })
            })
        }
        
        if(memberTwoExists === null){
            return new Promise<ChatRoomInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "The user you are trying to chat to doesn't exist anymore. Please reload the page and try again.",
                        code:"CM002"
                    })
            })
        }

        const query = `Select "ROOM_ID" FROM public."SingleChatRoom" s WHERE s."MEMBER_ONE" IN ($1, $2) AND s."MEMBER_TWO" IN ($1, $2) AND s."MEMBER_ONE" <> s."MEMBER_TWO";`
        const params = [memberOne, memberTwo];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve( new ChatModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }
    
    static async checkUserHasAccess(memberOne: string, roomId: string): Promise<ChatRoomInterface | null> {

        // memberOne is the user themselves

        // making sure user does exist before fetching all other users
        const memberOneExists= await LoginModel.findUser(memberOne);
        if(memberOneExists === null){
            return new Promise<ChatRoomInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "Please log in and try again.",
                        code:"CM003"
                    })
            })
        }

        const query = `Select "ROOM_ID" FROM public."SingleChatRoom" s WHERE (s."MEMBER_ONE" = $1 OR s."MEMBER_TWO" =$1) AND "ROOM_ID" = $2;`
        const params = [memberOne, roomId];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve( new ChatModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

    static async getMessages(memberOne: string, roomId: string): Promise<ChatMessageInterface[]> {

        // memberOne is the user themselves

        // making sure user does exist before fetching all other users
        const memberOneExists= await LoginModel.findUser(memberOne);
        if(memberOneExists === null){
            return new Promise<ChatMessageInterface[]>((resolve, reject) => {
                reject(
                    {
                        message: "Please log in and try again.",
                        code:"CM005"
                    })
            })
        }

        const query = `Select * FROM public."SingleChatMessages" s WHERE s."ROOM_ID" = $1 ORDER BY s."CREATED_AT" ASC;`
        const params = [roomId];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    resolve(
                        data.map( d=> {
                            return new ChatModel(d);
                        })
                    );
                })
                .catch(err => reject(err));
        })
    }

    static async createMessage(memberOne: string, roomId: string, details: string): Promise<ChatMessageInterface | null> {

        // memberOne is the user themselves

        // making sure user has permission to create the message
        // do not need to check if user exists because this.checkUserHasAccess already checks it once
        const userHasAccess = await this.checkUserHasAccess(memberOne, roomId);
        if(userHasAccess === null) {
            return new Promise<ChatMessageInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "User does not have permissions to send messages to this chat.",
                        code:"CM004"
                    })
            })
        }

        const query = `INSERT INTO public."SingleChatMessages" ("ROOM_ID", "SENDER", "DETAILS") VALUES ($1, $2, $3) returning *;`
        const params = [roomId, memberOne, details];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve( new ChatModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }
}