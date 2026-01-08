import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const AdminLogin: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const { data, error: signInError } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			// Clear password from memory as soon as possible
			setPassword('');

			if (signInError) {
				setError(signInError.message);
				return;
			}

			const user = data?.user ?? null;
			if (!user) {
				setError('No user returned from Supabase.');
				return;
			}

			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('role')
				.eq('id', user.id)
				.single();

			if (profileError || !profile) {
				setError('Unable to fetch profile.');
				await supabase.auth.signOut();
				navigate('/auth');
				return;
			}

			if (profile.role !== 'admin') {
				setError('Access denied: not an admin');
				await supabase.auth.signOut();
				navigate('/auth');
				return;
			}

			navigate('/admin/dashboard');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			<h2>Admin Login</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label>Email</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				<div>
					<label>Password</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>
				<button type="submit" disabled={loading}>
					{loading ? 'Signing in...' : 'Sign in'}
				</button>
				{error && <div style={{ color: 'red' }}>{error}</div>}
			</form>
		</div>
	);
};

export default AdminLogin;