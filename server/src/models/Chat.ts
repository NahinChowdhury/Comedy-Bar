import { client } from './index';
import { LoginModel, UserInterface } from './Login';

export interface ChatMessageInterface {
    MESSAGE_ID?: string;
    ROOM_ID?: string;
    SENDER?: string;
    DETAILS?: string;
    READ?: boolean;
    CREATED_AT?: Date;
    UPDATED_AT?: Date;
    READ_AT?: Date;
    SENDER_FULL_NAME?: string;
}

export interface ChatRoomInterface {
    ROOM_ID?: string;
    MEMBER_ONE?: string;
    MEMBER_TWO?: string;
    STATUS?: string;
    CREATED_BY?: string;
    CREATED_AT?: Date;
    OTHER_MEMBER?: string; // this is only created as calculation in findUserChats
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
    SENDER_FULL_NAME?: string;

    MEMBER_ONE?: string;
    MEMBER_TWO?: string;
    STATUS?: string;
    CREATED_BY?: string;
    OTHER_MEMBER?: string;

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
                        code:"CM008"
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

    static async findUserChats(memberOne: string): Promise<ChatRoomInterface[] | null> {

        // memberOne is the user themselves
        // memberTwo is the other person our user wants to chat to

        // making sure user does exist before fetching all other users
        const memberOneExists = await LoginModel.findUser(memberOne);
        if(memberOneExists === null){
            return new Promise<ChatRoomInterface[] | null>((resolve, reject) => {
                reject(
                    {
                        message: "Please log in and try again.",
                        code:"CM009"
                    })
            })
        }

        const query = `Select "ROOM_ID", 
                        CASE
                            WHEN "MEMBER_ONE" = $1 THEN "MEMBER_TWO"
                            ELSE "MEMBER_ONE" 
                        END AS "OTHER_MEMBER" 
                        FROM public."SingleChatRoom" s WHERE (s."MEMBER_ONE" = $1 OR s."MEMBER_TWO" = $1) AND s."MEMBER_ONE" <> s."MEMBER_TWO";`
        const params = [memberOne];

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
                    )
                })
                .catch(err => reject(err));
        })
    }    
    
    static async findOtherChatMember(currentUser: string, roomId: string): Promise<ChatMessageInterface | null> {

        // currentUser is the user themselves

        // making sure user does exist before fetching all other users
        const memberOneExists = await LoginModel.findUser(currentUser);
        if(memberOneExists === null){
            return new Promise<null>((resolve, reject) => {
                reject(
                    {
                        message: "Please log in and try again.",
                        code:"CM011"
                    })
            })
        }

        const query = `SELECT p."USERNAME" as "SENDER", 
                        CASE
                                WHEN p."FIRSTNAME"  <> '' OR p."LASTNAME"  <> '' THEN p."FIRSTNAME"  || ' ' || p."LASTNAME" 
                                ELSE NULL
                            END AS "SENDER_FULL_NAME"
                        FROM public."SingleChatRoom" s
                        JOIN public."Profile" p ON
                            (s."MEMBER_ONE" = p."USERNAME" OR s."MEMBER_TWO" = p."USERNAME")
                        WHERE s."ROOM_ID" = $2
                            AND p."USERNAME" <> $1;`
        const params = [currentUser, roomId];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data otherMemberFound")
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
                        code:"CM010"
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
                        code:"CM007"
                    })
            })
        }

        const query = `Select s.*,
                        CASE
                                WHEN p."FIRSTNAME"  <> '' OR p."LASTNAME"  <> '' THEN p."FIRSTNAME"  || ' ' || p."LASTNAME" 
                                ELSE NULL
                            END AS "SENDER_FULL_NAME"
                        FROM public."SingleChatMessages" s
                        left join public."Profile" p
                        on p."USERNAME" = s."SENDER" 
                        WHERE s."ROOM_ID" = $1
                        ORDER BY s."CREATED_AT" asc;`
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

        const query = `INSERT INTO public."SingleChatMessages" ("ROOM_ID", "SENDER", "DETAILS") VALUES ($1, $2, $3) 
                        returning 
                            "SingleChatMessages".*,
                            CASE
                                WHEN p."FIRSTNAME"  <> '' OR p."LASTNAME"  <> '' THEN p."FIRSTNAME"  || ' ' || p."LASTNAME" 
                                ELSE NULL
                            END AS "SENDER_FULL_NAME"
                        FROM public."SingleChatMessages" s
                        JOIN public."Profile" p ON s."SENDER" = p."USERNAME";`
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
    
    static async editMessage(memberOne: string, roomId: string, messageId: string, details: string): Promise<ChatMessageInterface | null> {

        // memberOne is the user themselves

        // making sure user has permission to create the message
        // do not need to check if user exists because this.checkUserHasAccess already checks it once
        const userHasAccess = await this.checkUserHasAccess(memberOne, roomId);
        if(userHasAccess === null) {
            return new Promise<ChatMessageInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "User does not have permissions to send messages to this chat.",
                        code:"CM005"
                    })
            })
        }

        const query = `UPDATE public."SingleChatMessages"
                        SET "DETAILS" = $1, "UPDATED_AT" = now()
                        WHERE "ROOM_ID" = $2 AND "SENDER" = $3 AND "MESSAGE_ID" = $4
                        returning *;`;
        const params = [details, roomId, memberOne, messageId];

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

    static async deleteMessage(memberOne: string, roomId: string, messageId: string): Promise<ChatMessageInterface | null> {

        // memberOne is the user themselves

        // making sure user has permission to delete the message
        // do not need to check if user exists because this.checkUserHasAccess already checks it once
        const userHasAccess = await this.checkUserHasAccess(memberOne, roomId);
        if(userHasAccess === null) {
            return new Promise<ChatMessageInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "User does not have permissions to delete messages in this chat.",
                        code:"CM006"
                    })
            })
        }
        
        const query = `DELETE FROM public."SingleChatMessages" WHERE "ROOM_ID" = $1 AND "SENDER" = $2 AND "MESSAGE_ID" = $3 returning *;`;
        const params = [roomId, memberOne, messageId];

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