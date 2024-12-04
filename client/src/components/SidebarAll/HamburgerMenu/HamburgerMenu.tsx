// client/src/components/HamburgerMenu/HamburgerMenu.tsx
import React, { useState, useContext } from 'react';
import './HamburgerMenu.css';
import { AuthContext } from '../../../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom'; // 追加

interface HamburgerMenuProps {
  username: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ username }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useContext(AuthContext); // AuthContextからlogoutを取得
  const navigate = useNavigate(); // useNavigateを取得

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="hamburger-menu-container">
      <div className="hamburger-icon" onClick={toggleMenu}>
        &#9776;
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          <p className="username">{username}</p>
          <button
            className="menu-item"
            onClick={() => navigate('/')} // 追加
          >
            画像分類
          </button>
          <button className="menu-item">機能2</button>
          <button className="menu-item">機能3</button>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;