import React, { useState } from "react";
import {
    BrowserRouter as Router,
    useHistory,
  } from "react-router-dom";
import { useAuth } from 'contexts/authContext'
import { validateEmail } from 'utils/helper'

const SignUp = () => {
    let auth = useAuth();
    let history = useHistory();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

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

                <h3>Sign Up</h3>

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
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        className="form-control hunter-form-control"
                        placeholder="Enter confirm password"
                        value={confirmPassword}
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
                    className="btn btn-dark btn-lg btn-block"
                    onClick={login}
                >
                    Sign in
                </button>
                <p className="forgot-password text-right">
                    Forgot <a href="/">password?</a>
                </p>
            </form>
        </div>
    );
}

export default SignUp