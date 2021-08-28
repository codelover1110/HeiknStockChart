import React, { createContext, useContext } from "react";
const authContext = createContext();

const authUser = {
  isAuthenticated: sessionStorage.getItem("auth-token") ? true : false,
  signin() {
    authUser.isAuthenticated = true;
    sessionStorage.setItem("auth-token", 12345678)
  },
  signup() {
    authUser.isAuthenticated = true;
    sessionStorage.setItem("auth-token", 12345678)
  },
  signout() {
    authUser.isAuthenticated = false;
    sessionStorage.removeItem("auth-token")
  }
};

export function useAuth() {
  return useContext(authContext);
}  

export default function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}
  
function useProvideAuth() {
  const signin = async ( email, password ) => {
    authUser.signin(email, password)
  };

  const signout = () => {
    authUser.signout()
  };

  return {
    authUser,
    signin,
    signout
  };
}