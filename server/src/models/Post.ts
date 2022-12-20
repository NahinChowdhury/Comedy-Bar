import { client } from './index';

interface ProfileInterface {
    USERNAME?: string;
    FIRSTNAME?: string;
    LASTNAME?: string;
}

interface PostInterface {
    POST_ID?: string;
    TITLE?: string;
    DETAILS?: string;
    UPDATED_AT?: string;
}

export class PostModel implements PostInterface {
    POST_ID?: string;
    TITLE?: string;
    DETAILS?: string;
    UPDATED_AT?: string;

    constructor(user: PostInterface) {
        Object.assign(this, user);
    }

    static getUserPost(username: string): Promise<PostInterface[] | null> {

        const query = `Select * FROM public."Posts" u WHERE u."USERNAME" = '${username}';`

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

}