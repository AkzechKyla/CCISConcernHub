import Footer from '../components/footer';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import ConcernDetails from '../components/concernDetails';
import DiscussionThread from '../components/discussionThread';
import Database from '../services/database';

export function ViewConcern({ userData }) {
    const navigate = useNavigate();
    const { concernId } = useParams();
    const [concern, setConcern] = useState(null);
    const [concernCreator, setConcernCreator] = useState(null);

    useEffect(() => {
        async function fetchConcern() {
            const fetchedConcern = await Database.getConcern(String(concernId));
            setConcern(fetchedConcern);
            setConcernCreator(await fetchedConcern.fetchCreator(userData));
        }
        fetchConcern();
    }, [concernId, userData]);

    const handleBackClick = () => {
        navigate('/my-concerns');
    };

    const handleStatusChange = (newStatus) => { // Added function to handle status change
        setStatus(newStatus);
    };

    if (!concern) {
        return <div>Loading...</div>;
    }

    // Sample chat messages (replace with actual discussion data)
    const initialDiscussion = [
        { sender: 'Student', message: 'Can someone help with my issue?', timestamp: '2024-10-02 10:15 AM' },
        { sender: 'Admin', message: 'We are looking into it. Please hold on.', timestamp: '2024-10-02 11:00 AM' },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <main className="p-6 gap-4">
                <div className="flex items-center mb-4 cursor-pointer" onClick={handleBackClick}>
                    <FaArrowLeft className="mr-2 text-blue-400" />
                    <h1 className="text-3xl font-bold mb-4 text-blue-400">View Concerns</h1>
                </div>

                <ConcernDetails
                    concern={concern}
                    concernCreator={concernCreator}
                    userData={userData}
                    onStatusChange={handleStatusChange} // Pass status change handler
                />

                <DiscussionThread
                    initialDiscussion={initialDiscussion}
                    status={status} // Pass status to DiscussionThread
                    concernCreatedDate={concern.dateSubmitted}
                />
            </main>
            <Footer />
        </div>
    );
}

export default ViewConcern;
