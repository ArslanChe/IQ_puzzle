import './app.css';
import {Route} from "react-router-dom";
import LoginPage from "./pages/loginPage";
import MainPage from "./pages/mainPage";

function App() {
    return (
        <div className="App">
            <Route path='/' component={LoginPage} exact/>
            <Route path='/lobbies' component={MainPage}/>
        </div>
    );
}

export default App;
