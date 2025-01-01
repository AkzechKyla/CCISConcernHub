import { useEffect, useState } from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import Footer from '../components/footer';
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
                setDisplayedConcerns(userConcerns.slice(0, ITEMS_PER_PAGE));
                setHasMore(userConcerns.length > ITEMS_PER_PAGE); // Set `hasMore` initially
            }
        }
        fetchUserConcerns();
    }, [userData]);

    const fetchMoreData = () => {
        const currentLength = displayedConcerns.length;

        if (currentLength >= concerns.length) {
            setHasMore(false);
            return;
        }

        const nextBatch = concerns.slice(currentLength, currentLength + ITEMS_PER_PAGE);
        setTimeout(() => {
            setDisplayedConcerns(prev => [...prev, ...nextBatch]);
            // Update `hasMore` if we've loaded all items
            if (currentLength + nextBatch.length >= concerns.length) {
                setHasMore(false);
            }
        }, 500); // Simulating API delay
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow p-4 mx-14">
                <h2 className="text-3xl font-bold mb-8 text-blue-400">My Concerns</h2>
                <div id="scrollableDiv" style={{ height: '70vh', overflow: 'auto' }}>
                    <InfiniteScroll
                        dataLength={displayedConcerns.length}
                        next={fetchMoreData}
                        hasMore={hasMore}
                        loader={
                            <div className="flex justify-center items-center h-full" style={{ transform: 'scale(0.5)' }}>
                                    <FadeLoader color="#bdbdbd" height={15} />
                            </div>
                        }
                        scrollableTarget="scrollableDiv"
                    >
                        <ConcernList concerns={displayedConcerns} />
                    </InfiniteScroll>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default MyConcerns;