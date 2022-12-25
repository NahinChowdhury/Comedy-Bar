import { Server } from "@overnightjs/core";

import { initDB } from "./models";
import { ApiController } from "./controllers/ApiController";
import * as bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import cookieParser  from "cookie-parser";
import * as io from 'socket.io';
import * as http from 'http';
import cors from 'cors';

import 'dotenv/config';

export class App extends Server {
	private close: http.Server;

	constructor() {
		super();
		// setting up session
		this.app.use( 
		session({
			secret: process.env.EXPRESS_SERCET,
			resave: true,
			saveUninitialized: true,
			cookie: {maxAge: 60 * 1000 * 300},
			rolling: true // reset exipration date with every request
		})
		);
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
		
		// Enable CORS for all routes
		this.app.use(cors());
		
		// Use the cookie-parser middleware
		this.app.use(cookieParser());

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
		
		this.close = this.app.listen(port, () => {
            console.log('Server listening on port: ' + port);
        });

	}

	private applyMiddleWares() {
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));
	}

	initSocket() {
		console.log("Connecting to socket")
		
        const io = require('socket.io')(this.close);

		io.on('connection', (socket: io.Socket) => {
			console.log('A user has connected');
		  
			// Broadcast a message to all clients except the one that just connected
			socket.broadcast.emit('message', 'A new user has joined the chat');
		  
			// Listen for a "message" event from the client
			socket.on('message', (message) => {
			  console.log(`Received message: ${message}`);
		  
			  // Send the message back to all clients
			  io.emit('message', message);
			});
		  
			// Listen for a "disconnect" event from the client
			socket.on('disconnect', () => {
			  console.log('A user has disconnected');
		  
			  // Broadcast a message to all clients except the one that just disconnected
			  socket.broadcast.emit('message', 'A user has left the chat');
			});
		  });
    }

	private async boostrap() {
		// Connect to db
		await initDB();
	}

	private setupControllers() {
		super.addControllers(new ApiController());
	}
}