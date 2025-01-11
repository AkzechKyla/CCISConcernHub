import { useEffect, useState, useRef, useCallback } from 'react';
import Footer from '../components/footer';
import ConcernList from '../components/concernList';
import Database, { Pagination } from '../services/database';
import LoadingSpinner from '../components/loading';

export function MyConcerns({ userData }) {
    const [concerns, setConcerns] = useState(undefined);
    const pagination = useRef(new Pagination());

    const fetchUserConcerns = useCallback(async () => {
        if (userData) {
            const userConcerns = await Database.getUserConcerns(userData.uid, pagination.current);
            console.log("Fetched user concerns:", userConcerns); // Debugging: Log the fetched user concerns

            if (concerns === undefined) {
                setConcerns(userConcerns);
            } else {
                setConcerns([...concerns, ...userConcerns]);
            }
        }
    }, [userData, concerns]);

    useEffect(() => {
        fetchUserConcerns();
    }, [fetchUserConcerns]);

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow p-4 mx-14">
                <h2 className="text-3xl font-bold mb-8 text-blue-400">My Concerns</h2>
                {
                    concerns === undefined ? <LoadingSpinner /> :
                    <ConcernList concerns={concerns} fetchUserConcerns={fetchUserConcerns} />
                }
            </div>
            <Footer />
        </div>
    );
}

export default MyConcerns; 


//userdata was change to concerns in the dashboardstats component