import { Route, Routes as Switch, BrowserRouter as Router } from "react-router-dom";
import { PrivateRoute } from './components/PrivateRoute';
import { Header, Footer } from './components/Index';
import { Login } from './main/Login';
import { Signup } from './main/Signup';
import { Profile } from "./main/Profile";
import { NotFound } from "./others/NotFound";
import { Posts } from "./main/Posts";
import { NewsFeed } from "./main/NewsFeed";
import { Chat } from "./main/Chat";
import { ChooseChat } from "./main/ChooseChat";

import './App.css';

function App() {
  return (
    <>
		
		<Router>
		<Header />
		
			<Switch>
				<Route path="/" element={ <PrivateRoute />  }>
					<Route path="/" element={ <ChooseChat /> }/>
				</Route>
				<Route path="/newsFeed" element={ <PrivateRoute />  }>
					<Route path="/newsFeed" element={ <NewsFeed /> }/>
				</Route>
				<Route path="/profile" element={ <PrivateRoute />  }>
					<Route path="/profile" element={ <Profile /> } />
				</Route>
				<Route path="/posts" element={ <PrivateRoute />  }>
					<Route path="/posts" element={ <Posts /> } />
				</Route>
				<Route path="/chatRooms" element={ <PrivateRoute />  }>
					<Route path="/chatRooms" element={ <ChooseChat /> } />
					<Route path="/chatRooms/:chatId" element={ <Chat /> } />
				</Route>

				<Route path="/signup" element={ <Signup /> } />
				<Route path="/login" element={ <Login /> }/>

				<Route path="*" element={ <NotFound /> } />

			</Switch>
		
		<Footer />
		</Router>

    </>
  );
}

export default App;
