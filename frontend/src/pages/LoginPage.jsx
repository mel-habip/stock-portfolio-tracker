import React, { useState, useContext } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import AnimatedButtonBox from '../fields/AnimatedButtonBox';
import { Button, Input, Spacer, Modal, Text, Row, Checkbox, Grid } from '@nextui-org/react';
import ErrorModule from '../components/ErrorModule';

import validatePassword from '../utils/validatePassword.mjs';

export default function LoginPage() {

    const { isDark, toggleTheme } = useContext(ThemeContext);
    const { setIsLoggedIn, setUserId, setAccessToken } = useContext(IsLoggedInContext);

    const [loginClicked, SetLoginClicked] = useState(false);
    const [signupClicked, SetSignupClicked] = useState(false);
    const [username, setUsername] = useState('');
    const [generalErrorMessage, setGeneralErrorMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [first_name, setFirstName] = useState(null);
    const [last_name, setLastName] = useState(null);

    async function catchError(response) {
        const data = await response.json();
        console.log('inside the function: ', data);
        if (data?.error_part === 'username') {
            setUsernameError(data?.message);
        } else if (data?.error_part === 'email') {
            setEmailError(data?.message);
        } else if (data?.error_part === 'password') {
            setPasswordError(data?.message);
        } else {
            setGeneralErrorMessage(`ERROR - ${data?.message || 'unknown'}`);
            setTimeout(() => {
                setGeneralErrorMessage('');
            }, 5000);
        }
    }

    return (
        <div className="LoginPage">
            <Button 
                css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem'}}
             onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}></i></Button>

            <div className="app-initial-buttons">
                <AnimatedButtonBox title="New here?" button_text="Sign-Up Here" subtitle="you'll be prompted to enter your deets" onPress={() => SetSignupClicked(true)} />

                <Modal
                    closeButton
                    blur
                    aria-labelledby="modal-title"
                    open={signupClicked || loginClicked}
                    onClose={() => { setUsernameError(''); setPasswordError(''); SetSignupClicked(false); SetLoginClicked(false); }}
                >
                    <Modal.Header>
                        <Text b id="modal-title" size={18}>
                            Welcome {loginClicked ? 'Back!' : 'to the show!'}
                            <Text size={14}>
                                Please enter the information below
                            </Text>
                        </Text>
                    </Modal.Header>
                    <Modal.Body>
                        <ErrorModule errorMessage={generalErrorMessage}></ErrorModule>
                        <Spacer y={0.4} />
                        <Input
                            rounded
                            value={username}
                            initialValue=""
                            clearable
                            type="text"
                            required
                            pattern="[a-z0-9]{1,15}"
                            title="waht is this"
                            bordered
                            labelPlaceholder="Username*"
                            color={usernameError ? "error" : "primary"}
                            status={usernameError ? "error" : "default"}
                            helperText={usernameError}
                            helperColor={usernameError ? "error" : "primary"}
                            onChange={(e) => setUsernameError('') || setUsername(e.target.value)} />
                        <Spacer y={0.5} />

                        <Input.Password
                            rounded
                            initialValue=""
                            value={password}
                            clearable
                            required
                            bordered
                            labelPlaceholder="Password*"
                            color={passwordError ? "error" : "primary"}
                            status={passwordError ? "error" : "default"}
                            helperText={passwordError}
                            helperColor={passwordError ? "error" : "primary"}
                            onChange={(e) => setPasswordError('') || setPassword(e.target.value)} />

                        <Row justify="space-between">

                            <Checkbox> <Text size={14}>Remember me</Text> </Checkbox>

                            {loginClicked ? <Text size={14}>Forgot password?</Text> : ''}

                        </Row>
                        {loginClicked ? <>
                            <Button
                                disabled={!validatePassword(password)}
                                auto
                                onPress={async () => {
                                    console.log('logging in');
                                    await fetch('http://localhost:8000/users/login/', {
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            username: username,
                                            password
                                        }),
                                        method: 'POST'
                                    }).then(async (res) => {
                                        console.log('response', res);
                                        if (res.status === 200) {
                                            res = await res.json();
                                            localStorage.setItem('access_token', res.access_token); //used for long-term storage
                                            localStorage.setItem('user_id', res.user_id);
                                            setAccessToken(res.access_token);
                                            setUserId(res.user_id);
                                            setIsLoggedIn(true);
                                        } else {
                                            catchError(res)
                                        }
                                    }).catch(catchError)
                                }}>
                                Log-in&nbsp;&nbsp;<i className="fa-solid fa-right-to-bracket"></i>
                            </Button>
                        </> : <>
                            <Spacer y={0.01} />
                            <Grid.Container gap={0.72} justify="center" direction="row">
                                <Grid >
                                    <Input
                                        size="sm"
                                        clearable
                                        bordered
                                        labelPlaceholder="First Name"
                                        color="primary"
                                        onChange={(e) => setFirstName(e.target.value)} />
                                </Grid>
                                <Grid>
                                    <Input
                                        size="sm"
                                        clearable
                                        bordered
                                        labelPlaceholder="Last Name"
                                        color="primary"
                                        onChange={(e) => setLastName(e.target.value)} />
                                </Grid>
                            </Grid.Container>
                            <Spacer y={0.5} />
                            <Input
                                rounded
                                value={email}
                                clearable
                                type="email"
                                bordered
                                labelPlaceholder="Email"
                                placeholder='you@domain.ca'
                                color={emailError ? "error" : "primary"}
                                status={emailError ? "error" : "default"}
                                helperText={emailError}
                                helperColor={emailError ? "error" : "primary"}
                                onChange={(e) => setEmailError('') || setEmail(e.target.value)} />
                            <Spacer y={0.1} />
                            <Button
                                auto
                                onPress={async () => {
                                    await fetch('http://localhost:8000/users/create_new_user/', {
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            username,
                                            password,
                                            email,
                                            first_name,
                                            last_name,
                                        }),
                                        method: 'POST'
                                    }).then(async (res) => {
                                        console.log('CREATION', res);
                                        if (res.status === 201) {
                                            await fetch('http://localhost:8000/users/login/', {
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    username,
                                                    password
                                                }),
                                                method: 'POST'
                                            }).then(async (res) => {
                                                console.log('LOG IN', res);
                                                if (res.status === 200) {
                                                    res = await res.json();
                                                    localStorage.setItem('access_token', res.access_token);
                                                    setAccessToken(res.access_token);
                                                    setUserId(res.user_id);
                                                    setIsLoggedIn(true);
                                                } else {
                                                    catchError(res)
                                                }
                                            }).catch(catchError);
                                        } else {
                                            catchError(res);
                                        }
                                    }).catch(catchError);
                                }}
                            >
                                Sign-Up
                            </Button>
                        </>}

                    </Modal.Body>
                </Modal>

                <AnimatedButtonBox title="Coming Back?" button_text="Log-In Here" subtitle="you'll be prompted to enter your creds" onPress={() => SetLoginClicked(true)} />
            </div>
        </div>
    );
}