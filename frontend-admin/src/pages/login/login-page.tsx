import React, { useState } from 'react';

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const LoginPage: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState('');

  function onLoginFail() {
    setStatusMessage('username or password incorrect');
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      body: new FormData(e.currentTarget),
      credentials: 'include',
    })
      .then((response) => {
        if (response.status == 400) {
          onLoginFail();
        }
        else {
          setStatusMessage('You have logged in successfully; other pages are now available!');
        }
      })
      .catch(() => { onLoginFail(); });
  }

  return (
    <main>

      <h1>Log In</h1>

      <form method="post" action={`${baseUrl}/auth/login`} onSubmit={handleSubmit}>
        <div>
          <label>Username:
            <input type="text" name="username" required />
          </label>
        </div>
        <div>
          <label>Password:
            <input type="password" name="password" required />
          </label>
        </div>
        <div>
          <input type="submit" value="Log in" />
        </div>
      </form>
      <p id="login-confirmation">{statusMessage}</p>

    </main>
  );
};

export default LoginPage;
