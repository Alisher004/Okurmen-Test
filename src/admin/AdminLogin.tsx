import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';

const AdminLogin: React.FC = () => {
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const { lang } = useI18n();

	// Simple admin password (in production, use real authentication)
	const ADMIN_PASSWORD = 'admin123';

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			if (password === ADMIN_PASSWORD) {
				// Store admin session in localStorage
				localStorage.setItem('adminLoggedIn', 'true');
				navigate('/admin/dashboard');
			} else {
				setError(lang === 'ru' ? 'Неверный пароль' : 'Пароль туура эмес');
			}
		} catch (err) {
			setError(lang === 'ru' ? 'Ошибка входа' : 'Кирүүдө ката');
		} finally {
			setLoading(false);
			setPassword('');
		}
	}

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
				{lang === 'ru' ? 'Вход администратора' : 'Администратор кирүүсү'}
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
						{lang === 'ru' ? 'Пароль администратора' : 'Администратор пароль'}
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

				<button
					type="submit"
					disabled={loading}
					style={{
						padding: '12px',
						fontSize: '16px',
						fontWeight: 'bold',
						backgroundColor: '#3b82f6',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: loading ? 'not-allowed' : 'pointer',
						opacity: loading ? 0.6 : 1,
						transition: 'background-color 0.2s',
					}}
					onMouseEnter={(e) => {
						if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
					}}
					onMouseLeave={(e) => {
						if (!loading) e.currentTarget.style.backgroundColor = '#3b82f6';
					}}
				>
					{loading 
						? (lang === 'ru' ? 'Загрузка...' : 'Күтүү...')
						: (lang === 'ru' ? 'Войти' : 'Кирүү')
					}
				</button>
			</form>

			<p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#6b7280' }}>
				{lang === 'ru' ? 'Пароль: admin123' : 'Пароль: admin123'}
			</p>
		</div>
	);
};

export default AdminLogin;