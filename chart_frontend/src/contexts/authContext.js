import React, { createContext, useContext } from "react";
const authContext = createContext();

const authUser = {
  isAuthenticated: sessionStorage.getItem("auth-token") ? true : false,
  async signin(email, password) {
    let formData = {
      username: email,
      password: password
    }
    return await fetch(process.env.REACT_APP_BACKEND_URL + '/signin/', {
      method: "POST",
      body: JSON.stringify(formData)
    })
      .then(response => {
          return response.json();
      })
      .then(res => {
        if (!res.user_id) {
          throw new Error('SignIn failed');
        }
        return {
          success: true,
          user_id: res.user_id
        }
      })
      .catch(err => {
        return {
          success: false,
          error: "User Name or Password is wrong"
        }
      })
  },
  async signup(username, email, password1, password2) {
    let formData = new FormData()  
    formData.append('username', username);
    formData.append('email', email);
    formData.append('first_name', "");
    formData.append('last_name', "");
    formData.append('password1', password1);
    formData.append('password2', password2);
    return await fetch(process.env.REACT_APP_BACKEND_URL + '/signup/', {
      method: "POST",
      body: formData
    })
      .then(response => {
          return response.json();
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(res.error);
        }
        if (res.success) {
          return {
            success: true
          }
        }
      })
      .catch(err => {
        return {
          success: false,
          error: 'Sign up failed'
        }
      })
  },
  async verify(userId, code) {
    let formData = {
      user_id: userId,
      num: code
    }
    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/verify/', {
      method: "POST",
      body: JSON.stringify(formData)
    })
      .then(response => {
          return response.json();
      })
      .then(res => {
        if (res.error) {
          throw new Error(res.error);
        }
        return res
      })
      .catch(err => {
        return { 
          verify: false,
          error: 'verify failed'
        }
      })
    authUser.isAuthenticated = true;
    sessionStorage.setItem("auth-token", 12345678)
    return res
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
  const verify = async ( userId, num ) => {
    authUser.signin(userId, num)
  };

  const signin = async ( email, password ) => {
    authUser.signin(email, password)
  };

  const signout = () => {
    authUser.signout()
  };

  return {
    authUser,
    verify,
    signin,
    signout
  };
}