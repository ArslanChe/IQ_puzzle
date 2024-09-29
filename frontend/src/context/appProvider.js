import React, {createContext, useContext, useEffect, useState} from "react";
import {useHistory} from "react-router-dom";

const LobbyContext = createContext();

const AppProvider = ({children}) => {
    const [selectedLobby, setSelectedLobby] = useState();
    const [user, setUser] = useState();
    const [notifications, setNotifications] = useState([]);
    const [lobbies, setLobbies] = useState([]);

    const history = useHistory();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo);

        if (!userInfo) history.push("/");
    }, [history]);

    return (
        <LobbyContext.Provider
            value={{
                selectedLobby,
                setSelectedLobby,
                user,
                setUser,
                notifications,
                setNotifications,
                lobbies,
                setLobbies,
            }}
        >
            {children}
        </LobbyContext.Provider>
    );
};

export const LobbyState = () => {
    return useContext(LobbyContext);
};

export default AppProvider;
