import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setIsSessionExpired, setUser } from "../redux/slices/authSlice";

// ...existing imports...

const PrivateRoute = ({ children }) => {
    const navigate = useNavigate();
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("PrivateRoute: token", token, "user", user);
        
        const checkSessionExpired = async () => {
            if (!token) return;
            const result = await window.electron.token.verify(token);
            console.log(result)
            if (!result || !result.user) {
                dispatch(setIsSessionExpired(true));
                navigate('/auth/expired');
            } else {
                dispatch(setUser(result.user));
            }
        };

        if (!token) {
            navigate("/auth/login");
        } else if (!user) {
            checkSessionExpired();
        }
    }, [token, user, dispatch,navigate]);

    if (!token || !user) {
        return <div>Cargando...</div>;
    }

    return <div>{children}</div>;
};

export default PrivateRoute;