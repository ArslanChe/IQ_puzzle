import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app';
import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter} from "react-router-dom";
import AppProvider from "./context/appProvider";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <ChakraProvider>
            <AppProvider>
                <App/>
            </AppProvider>
        </ChakraProvider>
    </BrowserRouter>
);

