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

}