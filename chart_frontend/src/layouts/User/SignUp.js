import React, { useState } from "react";
import { useAuth } from 'contexts/authContext'
import { validateEmail } from 'utils/helper'

const SignUp = () => {
    let auth = useAuth();
    const [username, setUserName] = useState('')
    const [email, setEmail] = useState('')
    const [error, setError] = useState(-1)
    const [message, setMessage] = useState()
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
    
    const handleUserNameChange = (e) => {
        setUserName(e.target.value)
    }

    const signup = async () => {
        if (!username.length) {
            setError(1)
            setMessage('user name is wrong')
            return
        }
        if (!email.length) {
            setError(1)
            setMessage('user email is wrong')
            return
        }
        if (!password.length || !confirmPassword.length) {
            setError(1)
            setMessage('password or confirm password is wrong')
            return
        }
        if (password !== confirmPassword) {
            setError(1)
            setMessage('password and confirm password is not matched')
            return
        }
        if (!validateEmail(email)){
            setError(1)
            setMessage('Invalid email')
            return
        }
        const res = await auth.authUser.signup(username, email, password, confirmPassword)
        if (res.success) {
            setError(0)
            setMessage('Sign Up is successed')
        } else {
            setError(1)
            setMessage(res.error)
            return
        }
    }

    const handleModalClose = () => {
        setError(-1);
        setMessage('');
    }

    return (
        <div className={"login-form"}>
            <div>

                <h3>Sign Up</h3>

                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="name"
                        className="form-control hunter-form-control"
                        placeholder="Enter user name"
                        value={username}
                        onChange={(e) => { handleUserNameChange(e)}}
                    />
                </div>
                
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
            </div>
            {error !== -1 && 
                <div className="alert alert-primary" role="alert">
                    <div className="alert-container">
                        <div className="alert-content">
                            {message}
                        </div>
                        <button type="button" className="btn btn-primary modal-close-button hunter-modal-small-button" onClick={() => { handleModalClose() }}>Close</button>
                    </div>
                </div>   
            }
        </div>
    );
}

export default SignUp