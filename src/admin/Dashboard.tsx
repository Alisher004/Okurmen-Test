import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import QuestionsAdmin from './Questions';

interface NavItem {
	id: string;
	label: string;
	component: React.ReactNode;
}

const AdminDashboard: React.FC = () => {
	const [activeTab, setActiveTab] = useState('questions');
	const navigate = useNavigate();
	const { lang } = useI18n();

	const navItems: NavItem[] = [
		{
			id: 'questions',
			label: lang === 'ru' ? 'Вопросы' : 'Суроолор',
			component: <QuestionsAdmin />,
		},
		{
			id: 'tests',
			label: lang === 'ru' ? 'Тесты' : 'Тесттер',
			component: (
				<div style={{ padding: '20px' }}>
					<h3>{lang === 'ru' ? 'Управление тестами' : 'Тесттерди башкаруу'}</h3>
					<p>{lang === 'ru' ? 'Скоро' : 'Өндүү'}...</p>
				</div>
			),
		},
	];

	const handleLogout = () => {
		localStorage.removeItem('adminLoggedIn');
		navigate('/admin/login');
	};

	const activeComponent = navItems.find(item => item.id === activeTab)?.component;

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
			{/* Header */}
			<div style={{
				backgroundColor: 'white',
				borderBottom: '1px solid #e5e7eb',
				padding: '16px 24px',
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}>
				<h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
					{lang === 'ru' ? 'Админ панель' : 'Админ панели'}
				</h1>
				<button
					onClick={handleLogout}
					style={{
						padding: '8px 16px',
						backgroundColor: '#ef4444',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '14px',
						fontWeight: '500',
						transition: 'background-color 0.2s',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = '#dc2626';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = '#ef4444';
					}}
				>
					{lang === 'ru' ? 'Выход' : 'Чыгуу'}
				</button>
			</div>

			<div style={{ display: 'flex' }}>
				{/* Sidebar */}
				<div style={{
					width: '200px',
					backgroundColor: 'white',
					borderRight: '1px solid #e5e7eb',
					padding: '20px 0',
				}}>
					{navItems.map(item => (
						<button
							key={item.id}
							onClick={() => setActiveTab(item.id)}
							style={{
								width: '100%',
								padding: '12px 16px',
								textAlign: 'left',
								backgroundColor: activeTab === item.id ? '#f3f4f6' : 'transparent',
								border: 'none',
								borderLeft: activeTab === item.id ? '4px solid #3b82f6' : '4px solid transparent',
								cursor: 'pointer',
								fontSize: '14px',
								transition: 'background-color 0.2s',
							}}
							onMouseEnter={(e) => {
								if (activeTab !== item.id) {
									e.currentTarget.style.backgroundColor = '#f9fafb';
								}
							}}
							onMouseLeave={(e) => {
								if (activeTab !== item.id) {
									e.currentTarget.style.backgroundColor = 'transparent';
								}
							}}
						>
							{item.label}
						</button>
					))}
				</div>

				{/* Content */}
				<div style={{
					flex: 1,
					padding: '20px',
				}}>
					{activeComponent}
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
