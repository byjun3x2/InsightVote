import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #ccc',
    marginBottom: '1rem',
  };

  const linkStyle: React.CSSProperties = {
    margin: '0 0.5rem',
    textDecoration: 'none',
    color: '#007bff',
  };

  return (
    <header style={headerStyle}>
      <Link href="/" style={{ ...linkStyle, fontSize: '1.5rem', fontWeight: 'bold' }}>
        InsightVote
      </Link>
      <nav>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: '1rem' }}>{user?.name}님, 안녕하세요!</span>
            <button onClick={logout}>로그아웃</button>
          </>
        ) : (
          <>
            <Link href="/login" style={linkStyle}>로그인</Link>
            <Link href="/register" style={linkStyle}>회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
