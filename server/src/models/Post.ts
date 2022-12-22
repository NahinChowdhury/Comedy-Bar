import { client } from './index';

interface ProfileInterface {
    POST_ID?: string;
    USERNAME?: string;
    TITLE?: string;
    DETAILS?: string;
    UPDATED_AT?: Date;
    CREATED_AT?: string;
}

interface PostInterface {
    POST_ID?: string;
    USERNAME?: string;
    TITLE?: string;
    DETAILS?: string;
    UPDATED_AT?: Date;
    CREATED_AT?: Date;
}

export class PostModel implements PostInterface {
    POST_ID?: string;
    USERNAME?: string;
    TITLE?: string;
    DETAILS?: string;
    UPDATED_AT?: Date;
    CREATED_AT?: Date;

    constructor(user: PostInterface) {
        Object.assign(this, user);
    }

    static getUserPost(username: string): Promise<PostInterface[] | null> {

        const query = `Select * FROM public."Posts" u 
                        WHERE u."USERNAME" = '${username}'
                        ORDER BY u."UPDATED_AT" DESC;`

        return new Promise((resolve, reject) => {
            client.query(query)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    resolve(
                        data.map( d=> {
                            return new PostModel(d);
                        })
                    );
                    
                })
                .catch(err => reject(err));
        })
    }
    
    static getGlobalPosts(username: string): Promise<PostInterface[] | null> {

        const query = `Select * FROM public."Posts" u 
                        WHERE u."USERNAME" != '${username}'
                        ORDER BY u."UPDATED_AT" DESC;`

        return new Promise((resolve, reject) => {
            client.query(query)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    resolve(
                        data.map( d=> {
                            return new PostModel(d);
                        })
                    );
                    
                })
                .catch(err => reject(err));
        })
    }

    static updateUserPost(username: string, id: string, title: string, details: string): Promise<PostInterface | null> {

        const query = `UPDATE public."Posts" p
                        SET "TITLE" = $1, "DETAILS" = $2, "UPDATED_AT" = now()
                        WHERE "POST_ID" = $3 AND "USERNAME" = $4
                        RETURNING *;`
        const params = [title, details, id, username];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    if(data.length > 0){
                        resolve(new PostModel(data[0]));
                    }else{
                        resolve(null);
                    }
                    
                })
                .catch(err => reject(err));
        })
    }

    static createUserPost(username: string, title: string, details: string): Promise<PostInterface | null> {

        const query = `INSERT INTO public."Posts" ("USERNAME" , "TITLE", "DETAILS") VALUES ($1, $2, $3) returning *;`
        const params = [username, title, details,];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    if(data.length > 0){
                        resolve(new PostModel(data[0]));
                    }else{
                        resolve(null);
                    }
                    
                })
                .catch(err => reject(err));
        })
    }

    static deleteUserPost(username: string, id: string): Promise<PostInterface | null> {

        const query = `DELETE FROM public."Posts" WHERE "USERNAME" = $1 AND "POST_ID" = $2 returning *;`
        const params = [username, id];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    
                    if(data.length > 0){
                        resolve(new PostModel(data[0]));
                    }else{
                        resolve(null);
                    }
                    
                })
                .catch(err => reject(err));
        })
    }

}