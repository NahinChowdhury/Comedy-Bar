import { client } from './index';

export interface FriendsInterface {
    USER_ID?: string;
    FRIEND_ID?: string;
    CREATED_AT?: Date;
}

export class FriendsModel implements FriendsInterface {
    USER_ID?: string;
    FRIEND_ID?: string;
    CREATED_AT?: Date;

    constructor(user: FriendsInterface) {
        Object.assign(this, user);
    }

    static getUserFriends(username: string): Promise<FriendsInterface[]> {

        const query = `Select * FROM public."Friends" u WHERE u."USER_ID" = $1;`
        const params = [username]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    resolve(
                        data.map( d=> {
                            return new FriendsModel(d);
                        })
                    );
                })
                .catch(err => reject(err));
        })
    }

    static getOneFriend(username: string, friendId: string): Promise<FriendsInterface | null> {

        const query = `Select * FROM public."Friends" u WHERE u."USER_ID" = $1 AND u."FRIEND_ID" = $2;`
        const params = [username, friendId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new FriendsModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

    static async addUserFriend(username: string, friendId: string, ): Promise<FriendsInterface | null> {

        // making sure post does exist before attempting to update it
        const friendExists = await this.getOneFriend(username, friendId);

        if(friendExists !== null){
            return new Promise<FriendsInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "The friend you are trying to add has already been added.",
                        code:"MF001"    
                    })
            })
        }

        const query = `INSERT INTO public."Friends" ("USER_ID" , "FRIEND_ID") VALUES ($1, $2) returning *;`
        const params = [username, friendId];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    if(data.length > 0){
                        resolve(new FriendsModel(data[0]));
                    }else{
                        resolve(null);
                    }
                    
                })
                .catch(err => reject(err));
        })
    }


    static async deleteUserFriend(username: string, friendId: string, ): Promise<FriendsInterface | null> {

        // making sure post does exist before attempting to update it
        const friendExists = await this.getOneFriend(username, friendId);

        if(friendExists === null){
            return new Promise<FriendsInterface | null>((resolve, reject) => {
                reject(
                    {
                        message: "The friend you are trying to remove has already been removed.",
                        code:"MF002"    
                    })
            })
        }
        const query = `DELETE FROM public."Friends" WHERE "USER_ID" = $1 AND "FRIEND_ID" = $2 returning *;`
        const params = [username, friendId];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    if(data.length > 0){
                        resolve(new FriendsModel(data[0]));
                    }else{
                        resolve(null);
                    }
                    
                })
                .catch(err => reject(err));
        })
    }
}