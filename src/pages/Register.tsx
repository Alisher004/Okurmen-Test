import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../context/AuthContext';

function Register() {
  const { lang } = useI18n();
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError(lang === 'ru' ? 'Заполните все поля' : 'Бардык чөлөктөрдү толуктаңыз');
      return;
    }

    if (password !== confirmPassword) {
      setError(lang === 'ru' ? 'Пароли не совпадают' : 'Пароллор дал келбейт');
      return;
    }

    if (password.length < 6) {
      setError(lang === 'ru' ? 'Пароль должен быть не менее 6 символов' : 'Пароль ең болмочно 6 символдон турушу керек');
      return;
    }

    try {
      await register(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || (lang === 'ru' ? 'Ошибка регистрации' : 'Каттаудо ката'));
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '80px auto',
      padding: '40px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px' }}>
        {lang === 'ru' ? 'Регистрация' : 'Катталуу'}
      </h2>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            {lang === 'ru' ? 'Email' : 'Email'}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={lang === 'ru' ? 'example@mail.com' : 'example@mail.com'}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            {lang === 'ru' ? 'Пароль' : 'Пароль'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={lang === 'ru' ? 'Введите пароль' : 'Паролду киргизиңиз'}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            {lang === 'ru' ? 'Подтвердите пароль' : 'Паролду кайра киргизиңиз'}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={lang === 'ru' ? 'Повторите пароль' : 'Паролду кайра киргизиңиз'}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          {isLoading 
            ? (lang === 'ru' ? 'Загрузка...' : 'Күтүү...')
            : (lang === 'ru' ? 'Зарегистрироваться' : 'Катталуу')
          }
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
        {lang === 'ru' ? 'Уже есть аккаунт?' : 'Аккаунтуңуз баредеби?'}{' '}
        <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
          {lang === 'ru' ? 'Войти' : 'Кирүү'}
        </Link>
      </p>
    </div>
  );
}

export default Register;