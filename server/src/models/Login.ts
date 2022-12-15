import { client } from './index';

interface UserInterface {
    USERNAME?: string;
    PASSWORD?: string;
}

export class LoginModel implements UserInterface {
    USERNAME?: string;
    PASSWORD?: string;

    constructor(user: UserInterface) {
        Object.assign(this, user);
    }

    static verifyUser(username: string, password: string): Promise<LoginModel | null> {

        console.log("inside model")
        console.log(username)
        console.log(password)

        const query = `Select u."USERNAME", u."PASSWORD" FROM public."User" u WHERE u."USERNAME" = '${username}' AND u."PASSWORD" = '${password}';`

        return new Promise((resolve, reject) => {
            client.query(query)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new LoginModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }


    static createNewUser(username: string, password: string): Promise<LoginModel | null>{
        
        const query = `INSERT INTO public."User" ("USERNAME" , "PASSWORD") VALUES ('${username}', '${password}') RETURNING *;`;

        return new Promise((resolve, reject) => {
            client.query(query)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new LoginModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }

    static findUser(username: string): Promise<LoginModel | null> {

        const query = `Select * FROM public."User" u WHERE u."USERNAME" = '${username}';`

        return new Promise((resolve, reject) => {
            client.query(query)
                .then(res => {
                    const data = res.rows;
                    console.log("data")
                    console.log(data)
                    if(data.length > 0){
                        resolve(new LoginModel(data[0]));
                    }else{
                        resolve(null);
                    }
                })
                .catch(err => reject(err));
        })
    }
}