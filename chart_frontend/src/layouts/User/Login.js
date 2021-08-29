import React, { useState } from "react";
import {
    BrowserRouter as Router,
    useHistory,
    useLocation
  } from "react-router-dom";
import { useAuth } from 'contexts/authContext'
import { validateEmail } from 'utils/helper'

const Login = () => {
    let auth = useAuth();
    let history = useHistory();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
    }
    
    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
    }
    
    const login = () => {
        if (!email.length || !password.length) {
            alert('Email or password is wrong')
            return
        }
        if (!validateEmail(email)){
            alert('Invalid email')
            return
        }
        auth.signin(email, password)
        history.push('/');
    }

    return (
        <div className={"login-form"}>
            <form>

                <h3>Log In</h3>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control hunter-form-control"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => { handleEmailChange(e)}}
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-control hunter-form-control"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => { handlePasswordChange(e)}}
                    />
                </div>

                <div className="form-group">
                    <div className="custom-control custom-checkbox">
                        <input type="checkbox" className="custom-control-input" id="customCheck1" />
                        <label className="custom-control-label" htmlFor="customCheck1">Remember me</label>
                    </div>
                </div>

                <button
                    className="btn btn-dark btn-lg btn-block hunter-signin-button"
                    onClick={login}
                >
                    Sign in
                </button>
                <div className="form-group hunter-form-signup-area">
                    <p className="sign-up-area text-left">
                        <a href="/signup">Sign Up?</a>
                    </p>
                    <p className="forgot-password text-right">
                        Forgot <a href="/">password?</a>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Login