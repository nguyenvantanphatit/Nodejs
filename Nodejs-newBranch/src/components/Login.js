import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Login() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await axios.post("http://localhost:5000/v1/auth/login", {
      username: userName,
      password: userPassword,
    });
    if (result.status === 200) {
      setIsSuccess(true);
    }
  };

  return (
    <>
      {isSuccess && <Navigate to="/" replace={true} />}
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
              alt="Your Company"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <a
                href="#"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                start your 14-day free trial
              </a>
            </p>
          </div>
          <form>
            <label>
              <p>Username</p>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </label>
            <label>
              <p>Password</p>
              <input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </label>
            <div>
              <button type="submit" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
export default Login;
