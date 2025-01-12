import { useEffect, useState, useRef, useCallback } from 'react';
import Footer from '../components/footer';
import ConcernList from '../components/concernList';
import DashboardStats from '../components/dashboardStats';
import Database, { Pagination } from '../services/database';
import LoadingSpinner from '../components/loading';

export function AdminDashboard({ userData }) {
    const [concerns, setConcerns] = useState(undefined);
    const pagination = useRef(new Pagination(5));

    const fetchCategoryConcerns = useCallback(async () => {
        if (userData) {
            const categoryConcerns = await Database.getCategoryConcerns(userData.assignedCategories, pagination.current);
            if (!concerns) {
                setConcerns(categoryConcerns);
            } else {
                setConcerns([...concerns, ...categoryConcerns]);
            }
        }
    }, [userData, concerns]);

    useEffect(() => {
        fetchCategoryConcerns();
    }, [fetchCategoryConcerns]);

    return (
        <div>
            <main className="container mx-auto p-4">
                <h2 className="text-2xl font-semibold mt-2 text-blue-400">Concern Overview</h2>
                {/* imbis na metrics ang pinasa sa dashboard, concerns na para makuha yung number (calculated*/}
                <DashboardStats concerns={concerns} />
                <h2 className="text-xl font-semibold mt-6 text-blue-400">Manage Concerns</h2>
                {concerns === undefined ? (
                    <LoadingSpinner />
                ) : (
                    <ConcernList
                        userData={userData}
                        concerns={concerns}
                        fetchUserConcerns={fetchCategoryConcerns}
                    />
                )}
            </main>
            <Footer />
        </div>
    );
}

export default AdminDashboard;
