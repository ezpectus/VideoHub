"use client";
import Link from 'next/link';
import {
    MdHome,
    MdSubscriptions,
    MdOutlineAccountCircle,
    MdHistory,
    MdOutlineMusicNote,
    MdOutlineMovie,
    MdSportsEsports,
    MdOutlineArticle,
    MdOutlineEmojiEvents,
    MdOutlineLightbulb,
    MdExpandLess
} from 'react-icons/md';
import { SiYoutubeshorts } from 'react-icons/si';
import { useAuth } from '@/hooks/useAuth';

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <aside className="sidebar">
            <div className="menu-section">
                <Link href="/" className="menu-item active">
                    <span className="menu-icon"><MdHome /></span>
                    <span className="menu-text">Головна</span>
                </Link>
                <Link href="/feed/subscriptions" className="menu-item">
                    <span className="menu-icon"><MdSubscriptions /></span>
                    <span className="menu-text">Підписки</span>
                </Link>
            </div>

            <div className="menu-section">
                <Link href={user ? `/user/${user.id}` : '/login'} className="menu-item">
                    <span className="menu-icon"><MdOutlineAccountCircle /></span>
                    <span className="menu-text">Мій канал</span>
                </Link>
                <Link href="/feed/history" className="menu-item">
                    <span className="menu-icon"><MdHistory /></span>
                    <span className="menu-text">Історія</span>
                </Link>
            </div>

            <div className="menu-section">
                <h3 className="menu-title">Що нового</h3>
                <Link href="/music" className="menu-item">
                    <span className="menu-icon"><MdOutlineMusicNote /></span>
                    <span className="menu-text">Музика</span>
                </Link>
                <Link href="/movies" className="menu-item">
                    <span className="menu-icon"><MdOutlineMovie /></span>
                    <span className="menu-text">Фільми</span>
                </Link>
                <Link href="/gaming" className="menu-item">
                    <span className="menu-icon"><MdSportsEsports /></span>
                    <span className="menu-text">Ігри</span>
                </Link>
                <Link href="/news" className="menu-item">
                    <span className="menu-icon"><MdOutlineArticle /></span>
                    <span className="menu-text">Новини</span>
                </Link>
                <Link href="/sports" className="menu-item">
                    <span className="menu-icon"><MdOutlineEmojiEvents /></span>
                    <span className="menu-text">Спорт</span>
                </Link>
                <Link href="/learning" className="menu-item">
                    <span className="menu-icon"><MdOutlineLightbulb /></span>
                    <span className="menu-text">Навчання</span>
                </Link>
            </div>
        </aside>
    );
};



export default Sidebar;