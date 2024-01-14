import React from 'react';
import Button from "../Button/Button";
import { useTelegram } from "../../hooks/useTelegram";
import './Header.css';

const Header = () => {
    const { user, onClose } = useTelegram();

    return (
        <div className="header">
            <Button onClick={onClose}>Закрыть</Button>
            {user ? (
                <>
                    <span className="username">{user.username}</span>
                    <br />
                    <span className="id">{user.id}</span>
                </>
            ) : null}
        </div>
    );
};

export default Header;
