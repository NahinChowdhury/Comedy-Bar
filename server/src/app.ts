import { Server } from "@overnightjs/core";

import { initDB } from "./models";
import { ApiController } from "./controllers/ApiController";
import * as bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import cookieParser  from "cookie-parser";

export class App extends Server {
  constructor() {
    super();
    // setting up session
    this.app.use( session({ 
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: {maxAge: 60 * 1000 * 300}
    }));
    this.applyMiddleWares();
    this.boostrap();
    this.setupControllers();
  }

  public start(): void {
    const port = process.env.PORT || 3001;

    this.app.use( (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });


    // Use the cookie-parser middleware
    this.app.use(cookieParser());

    // create session
    

    this.app.get('/set-session', (req, res) => {
      // Set a session variable with a key of 'mySession' and a value of 'myValue'
      req.session.mySession = 'myValue';
      console.log('req.session.mySession');
      console.log(req.session.mySession);
      res.send('Session variable set');
    });
    
    // Add a route that gets the value of the session variable
    this.app.get('/get-session', (req, res) => {
      // Get the value of the session variable with the key 'mySession'
      const sessionValue = req.session.mySession;
      res.send(`Session variable value: ${sessionValue}`);
    });
    
    this.app.listen(port, () => {
      console.log("Server listening on port: " + port);
    });
  }

  private applyMiddleWares() {


    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  private startUpConfig() {
    this.app.set( "views", path.join( __dirname, "views" ) );
    this.app.set( "view engine", "ejs" );
    // dotenv.config();
  }


  private async boostrap() {


    // Connect to db
    await initDB();

  }

  private setupControllers() {
    super.addControllers(new ApiController());
  }
}


// TODO: Setup database