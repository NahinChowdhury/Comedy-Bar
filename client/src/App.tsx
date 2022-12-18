import { Route, Routes as Switch, BrowserRouter as Router } from "react-router-dom";
import { PrivateRoute } from './components/PrivateRoute';
import { Header, Footer } from './components/Index';
import { Main } from './main/Main';
import { Login } from './main/Login';
import { Signup } from './main/Signup';
import './App.css';
import { Profile } from "./main/Profile";
import { NotFound } from "./others/NotFound";

function App() {
  return (
    <>
		
		<Router>
		<Header />
		
			<Switch>

				<Route path="/" element={ <PrivateRoute />  }>
					<Route path="/" element={<Profile />}/>
				</Route>
				<Route path="/" element={ <PrivateRoute />  }>
					<Route path="/hello" element={<>Hello this is hello page</>}/>
				</Route>
				<Route path="/profile" element={ <PrivateRoute />  }>
					<Route path="/profile" element={ <Profile /> } />
				</Route>

				<Route path="/signup" element={ <Signup /> } />
				<Route path="/login" element={<Login />}/>

				<Route path="*" element={<NotFound />} />

			</Switch>
		
		<Footer />
		</Router>

    </>
  );
}

export default App;
