// src/components/Setting.tsx
import React, { useState } from 'react';
import './Setting.css';

const Setting: React.FC = () => {
    const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [darkMode, setDarkMode] = useState<boolean>(false);

    const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
        setFontSize(size);
        // フォントサイズの変更ロジックをここに追加
    };

    const handleDarkModeToggle = () => {
        setDarkMode(!darkMode);
        // ダークモードの切り替えロジックをここに追加
    };

    return (
        <div className="settings-container">
            <h1>Settings</h1>
            <ul>
                <li>
                    ・文字の大きさ
                    <ul className="font-size-options">
                        <li
                            className={fontSize === 'small' ? 'selected' : ''}
                            onClick={() => handleFontSizeChange('small')}
                        >
                            小
                        </li>
                        <li
                            className={fontSize === 'medium' ? 'selected' : ''}
                            onClick={() => handleFontSizeChange('medium')}
                        >
                            中
                        </li>
                        <li
                            className={fontSize === 'large' ? 'selected' : ''}
                            onClick={() => handleFontSizeChange('large')}
                        >
                            大
                        </li>
                    </ul>
                </li>
                <li>
                    ・ダークモード
                    <div className="toggle-container">
                        <label className="switch">
                            <input type="checkbox" checked={darkMode} onChange={handleDarkModeToggle} />
                            <span className="slider round"></span>
                        </label>
                        <span>{darkMode ? 'ON' : 'OFF'}</span>
                    </div>
                </li>
            </ul>
        </div>
    );
};

export default Setting;