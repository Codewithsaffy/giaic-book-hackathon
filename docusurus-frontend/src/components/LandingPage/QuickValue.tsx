import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import { FaCube, FaCode, FaGlobe, FaClock } from 'react-icons/fa';

const stats = [
    { label: 'Modular Learning', value: '4', sub: 'Core Modules', icon: <FaCube /> },
    { label: 'In-Depth Topics', value: '150+', sub: 'Technical Topics', icon: <FaCode /> },
    { label: 'Available In', value: '2', sub: 'Languages', icon: <FaGlobe /> },
    { label: 'Latest Release', value: '2025', sub: 'Jazzy Edition', icon: <FaClock /> },
];

export default function QuickValue() {
    return (
        <section className={styles.valueSection}>
            <div className={styles.container}>
                <div className={styles.valueGrid}>
                    {stats.map((stat, idx) => (
                        <div key={idx} className={styles.valueCard}>
                            <div className={styles.valueIcon}>{stat.icon}</div>
                            <div className={styles.valueContent}>
                                <div className={styles.valueBig}>{stat.value}</div>
                                <div className={styles.valueSub}>{stat.sub}</div>
                                <div className={styles.valueLabel}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
