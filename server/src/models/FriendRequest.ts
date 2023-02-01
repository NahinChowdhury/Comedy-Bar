import { client } from './index';

export interface FriendRequestInterface {
    REQUEST_ID?: string;
    SENDER_ID?: string;
    RECEIVER_ID?: string;
    CREATED_AT?: Date;
}

export class FriendRequestModel implements FriendRequestInterface {
    REQUEST_ID?: string;
    SENDER_ID?: string;
    RECEIVER_ID?: string;
    CREATED_AT?: Date;

    constructor(user: FriendRequestInterface) {
        Object.assign(this, user);
    }

    static getUserFriendRequests(receiverId: string): Promise<FriendRequestInterface[]> {

        const query = `Select * FROM public."FriendRequests" u WHERE u."RECEIVER_ID" = $1;`
        const params = [receiverId]

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    resolve(
                        data.map( d=> {
                            return new FriendRequestModel(d);
                        })
                    );
                })
                .catch(err => reject(err));
        })
    }

}