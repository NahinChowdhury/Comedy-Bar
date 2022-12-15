import { Server } from "@overnightjs/core";

import { initDB } from "./models";
import { ApiController } from "./controllers/ApiController";
import * as bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";
import cookieParser  from "cookie-parser";

export class App extends Server {
  constructor() {
    super();
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