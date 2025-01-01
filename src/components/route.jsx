import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from './header';

export default function RouteElement({
    element,
    headerProps,
    clientUser,
    userData,
}) {
    const navigate = useNavigate();

    useEffect(() => {
        if (clientUser === null) {
            navigate("/signin");
        }
    }, [clientUser, navigate]);

    return <div className="flex flex-wrap">
        <Header userData={userData} {...headerProps} />
        {element}
    </div>;
}
