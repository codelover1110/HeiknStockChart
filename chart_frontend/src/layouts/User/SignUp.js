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
    
    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value)
    }
    
    const signup = () => {
        if (!email.length || !password.length) {
            alert('Email or password is wrong')
            return
        }
        if (password !== confirmPassword) {
            alert('password and confirm password is not matched')
            return
        }
        if (!validateEmail(email)){
            alert('Invalid email')
            return
        }
        auth.signup(email, password)
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
                        onChange={(e) => { handleConfirmPasswordChange(e)}}
                    />
                </div>

                <button
                    className="btn btn-dark btn-lg btn-block hunter-signin-button"
                    onClick={signup}
                >
                    Sign up
                </button>
                <div className="form-group">
                    <p className="sign-up-area text-right">
                        <a href="/signin">Sign In?</a>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default SignUp