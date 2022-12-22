import { client } from './index';

interface ProfileInterface {
    USERNAME?: string;
    FIRSTNAME?: string;
    LASTNAME?: string;
}

export class ProfileModel implements ProfileInterface {
    USERNAME?: string;
    FIRSTNAME?: string;
    LASTNAME?: string;

    constructor(user: ProfileInterface) {
        Object.assign(this, user);
    }

    static getUserProfile(username: string): Promise<ProfileInterface | null> {

        console.log("inside model")
        console.log(username)

        const query = `Select * FROM public."Profile" u WHERE u."USERNAME" = '${username}';`

        return new Promise((resolve, reject) => {
            client.query(query)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new ProfileModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

    static updateUserProfile(username:string, firstname:string, lastname:string): Promise<ProfileInterface | null> {
        
        const query = `UPDATE public."Profile" p
                        SET "FIRSTNAME" = $1, "LASTNAME" = $2
                        WHERE "USERNAME" = $3
                        RETURNING *;`
        const params = [firstname, lastname, username];

        return new Promise((resolve, reject) => {
            client.query(query, params)
                .then(res => {
                    const data = res.rows;
                    console.log("profile update data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new ProfileModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

}