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

        const query = `Select "ROOM_ID" FROM public."SingleChatRoom" s WHERE s."MEMBER_ONE" IN ($1, $2) AND s."MEMBER_TWO" IN ($3, $4) AND s."MEMBER_ONE" <> s."MEMBER_TWO";`
        const params = [memberOne, memberTwo, memberOne, memberTwo];

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