import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(''); // idle, checking, available, taken
  const [emailStatus, setEmailStatus] = useState(''); // idle, checking, available, taken
  const router = useRouter();

  const checkUsername = async () => {
    if (!username) return;
    setUsernameStatus('checking');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-username`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    setUsernameStatus(response.ok ? 'available' : 'taken');
  };

  const checkEmail = async () => {
    if (!email) return;
    setEmailStatus('checking');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setEmailStatus(response.ok ? 'available' : 'taken');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (usernameStatus !== 'available' || emailStatus !== 'available') {
      setError('아이디와 이메일 중복 확인을 통과해야 합니다.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, email, password }),
      });

      if (response.ok) {
        router.push('/login'); // 회원가입 성공 시 로그인 페이지로 이동
      } else {
        const data = await response.text();
        setError(data || 'Failed to register');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  const renderStatusMessage = (status: string) => {
    if (status === 'checking') return <p style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}>확인 중...</p>;
    if (status === 'available') return <p style={{ fontSize: '0.8rem', margin: '0.25rem 0', color: 'green' }}>사용 가능한 아이디입니다.</p>;
    if (status === 'taken') return <p style={{ fontSize: '0.8rem', margin: '0.25rem 0', color: 'red' }}>이미 사용 중인 아이디입니다.</p>;
    return null;
  };

  const renderEmailStatusMessage = (status: string) => {
    if (status === 'checking') return <p style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}>확인 중...</p>;
    if (status === 'available') return <p style={{ fontSize: '0.8rem', margin: '0.25rem 0', color: 'green' }}>사용 가능한 이메일입니다.</p>;
    if (status === 'taken') return <p style={{ fontSize: '0.8rem', margin: '0.25rem 0', color: 'red' }}>이미 사용 중인 이메일입니다.</p>;
    return null;
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>회원가입</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>아이디 (Username)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={checkUsername}
            required
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
          {renderStatusMessage(usernameStatus)}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>이름 (Name)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>이메일 (Email)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={checkEmail}
            required
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
          {renderEmailStatusMessage(emailStatus)}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>비밀번호 (Password)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button 
          type="submit" 
          style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', cursor: (usernameStatus !== 'available' || emailStatus !== 'available') ? 'not-allowed' : 'pointer' }}
          disabled={usernameStatus !== 'available' || emailStatus !== 'available'}
        >
          회원가입
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        이미 계정이 있으신가요? <Link href="/login" style={{ color: '#007bff' }}>로그인</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
