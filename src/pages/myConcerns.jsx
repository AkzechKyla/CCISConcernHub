import { useEffect, useState } from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import Footer from '../components/Footer';
import ConcernList from '../components/concernList';
import Database from '../services/database';
import FadeLoader from "react-spinners/FadeLoader";

export function MyConcerns({ userData }) {
    const [concerns, setConcerns] = useState([]);
    const [displayedConcerns, setDisplayedConcerns] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        async function fetchUserConcerns() {
            if (userData) {
                const userConcerns = await Database.getUserConcerns(userData.uid);
                setConcerns(userConcerns);
            }
        }
        fetchUserConcerns();
    }, [userData]);


    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow p-4 mx-14">
                <h2 className="text-3xl font-bold mb-8 text-blue-400">My Concerns</h2>
                <ConcernList concerns={concerns}/>
            </div>
            <Footer />
        </div>
    );
}

export default MyConcerns;
