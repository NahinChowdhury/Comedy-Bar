import { Route, Routes as Switch, BrowserRouter as Router } from "react-router-dom";
import { Header, Footer } from  './components/Index';
import { Main } from './main/Main';
import { Login } from './main/Login';
import { Signup } from './main/Signup';
import './App.css';

function App() {
  return (
    <>
		<Header />
		
		<Router>
			<Switch>

				<Route path="/" element={<Main />} />
				<Route path="/hello" element={<>Hello this is hello page</>}/>
				<Route path="/login" element={<Login />}/>
				<Route path="/signup" element={<Signup />}/>
				<Route path="*" element={<>404 page not found</>} />

			</Switch>
		</Router>

		<Footer />
    </>
  );
}

export default App;
