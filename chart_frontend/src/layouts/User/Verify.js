import React, { useEffect, useState } from "react";
import {
    useHistory,
} from "react-router-dom";
import { useAuth } from 'contexts/authContext'

const Verify = () => {
    let auth = useAuth();
    let history = useHistory();
    const [code, setCode] = useState('')
    const [error, setError] = useState(-1)
    const [message, setMessage] = useState('')
    const userId = history.location.state ? history.location.state.userId : null
    
    const handleCodeChange = (e) => {
        setCode(e.target.value)
    }
    
    useEffect(() => {
        if (!userId) {
            history.push('/login')
        }
    }, [userId])

    const verify = async () => {
        if (!code.length) {
            setError(1)
            setMessage('confirmation code is empty')
            return
        }
        const res = await auth.authUser.verify(userId, code)
        if (res.verify) {
            history.push('/');
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

                <h3>Verify</h3>

                <div className="form-group">
                    <label>Verify Code</label>
                    <input
                        type="text"
                        className="form-control hunter-form-control"
                        placeholder="Enter verify code"
                        value={code}
                        onChange={(e) => { handleCodeChange(e)}}
                    />
                </div>

                <button
                    className="btn btn-dark btn-lg btn-block hunter-signin-button"
                    onClick={verify}
                >
                    Verify
                </button>
            </div>
            {error !== -1 && 
                <div class="alert alert-primary" role="alert">
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

export default Verify