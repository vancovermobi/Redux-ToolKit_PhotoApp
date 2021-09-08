import { unwrapResult } from "@reduxjs/toolkit";
import productApi from "api/productApi";
import { getMe } from "app/userSlice";
import SignIn from "features/Auth/pages/SignIn";
import firebase from "firebase";
import React, { Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { Button } from "reactstrap";
import "./App.scss";
import Header from "./components/Header";
import NotFound from "./components/NotFound/index";
// Lazy load - Code spliting
const Photo = React.lazy(() => import("./features/Photo"));

// Configure Firebase.
const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: "photo-app-7880b",
  storageBucket: "photo-app-7880b.appspot.com",
  messagingSenderId: "940367512828",
  appId: "1:940367512828:web:bf6b7039f8aec90b48c379",
  measurementId: "G-STBZLY25DR",
};
firebase.initializeApp(config);

function App() {
  const [productList, setProductList] = useState([]);
  const dispatch = useDispatch();

  // Axios fetch API
  useEffect(() => {
    const fetchProductList = async () => {
      try {
        const params = {
          _page: 1,
          _limit: 10,
        };
        const response = await productApi.getAll(params);
        console.log(response);
        setProductList(response.data);
      } catch (error) {
        console.log("Failed to fetch product list: ", error);
      }
    };

    fetchProductList();
  }, []);

  // Handle firebase auth change
  useEffect(() => {
    const unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged(async (user) => {
        if (!user) {
          // user logs out, handle something here
          console.log("User is not logged in");
          return;
        }

        // Get me when signed in
        // const action = getMe();
        try {
          const actionResult = await dispatch(getMe());
          const currentUser = unwrapResult(actionResult);
          console.log("Logged in user: ", currentUser);
        } catch (error) {
          console.log("Failed to login ", error.message);
          // show toast error
        }
      });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const handleButtonClick = async () => {
    try {
      const params = {
        _page: 1,
        _limit: 10,
      };
      const response = await productApi.getAll(params);
      console.log(response);
    } catch (error) {
      console.log("Failed to fetch product list: ", error);
    }
  };

  return (
    <div className="photo-app">
      <Suspense fallback={<div>Loading ... </div>}>
        <BrowserRouter>
          {/* TODO : Remove after testing */}
          <Header />

          <Button onClick={handleButtonClick}>Fetch Product List</Button>

          <Switch>
            <Redirect exact from="/" to="/photos" />

            <Route path="/photos" component={Photo} />
            <Route path="/sign-in" component={SignIn} />
            <Route component={NotFound} />
          </Switch>
        </BrowserRouter>
      </Suspense>
    </div>
  );
}

export default App;
