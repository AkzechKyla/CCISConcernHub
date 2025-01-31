import Footer from '../components/footer';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BackArrow from '../components/backArrow';
import ConcernDetails from '../components/concernDetails';
import DiscussionThread from '../components/discussionThread';
import Database from '../services/database';
import LoadingSpinner from '../components/loading';
import { showInfoToast, showSuccessToast, showErrorToast } from '../components/toastNotification';

export function ViewConcern({ userData }) {
    const { concernId } = useParams();
    const [concern, setConcern] = useState(null);
    const [concernCreator, setConcernCreator] = useState(null);
    const [status, _setStatus] = useState("");
    const [isAssigned, _setIsAssigned] = useState(false);

    function setStatus(newStatus) {
        if (newStatus === "Open" && status != "Open") {
            showErrorToast(`Concern cannot be set to Open once ${status} status.`);
            return;
        }

        concern.updateStatus(newStatus);
        _setStatus(newStatus);

        if (userData.isAdmin() && !concern.isAdminAssigned(userData)) {
            setIsAssigned(true);
        }

        concern.discussion.sendSystemMessage(`This concern is now marked as ${newStatus}.`);
        concern.saveToDatabase();
        showInfoToast(`Status updated to ${newStatus}.`);
    }

    function setIsAssigned(isAssigned) {
        const isAlreadyAssigned = concern.isAdminAssigned(userData);

        if (isAssigned) {
            concern.assignAdmin(userData);
        } else {
            if (!isAlreadyAssigned) {
                showErrorToast("Admin is not assigned to this concern.");
                return;
            }

            concern.unassignAdmin(userData);
            showSuccessToast("Admin unassigned successfully.");
        }

        _setIsAssigned(isAssigned);
        concern.saveToDatabase();
    }

    useEffect(() => {
        async function fetchConcern() {
            const fetchedConcern = await Database.getConcern(String(concernId));
            setConcern(fetchedConcern);
            setConcernCreator(await fetchedConcern.fetchCreator(userData));
            _setStatus(fetchedConcern.status);
            _setIsAssigned(fetchedConcern.isAdminAssigned(userData));
        }

        if (userData) {
            fetchConcern();
        }
    }, [concernId, userData]);

    return (
        <div className="min-h-screen flex flex-col">
            <main className="p-6 gap-4">
                <BackArrow label='Back'/>
                {
                    concern === null ? <LoadingSpinner /> : <>
                        <ConcernDetails
                            concern={concern}
                            concernCreator={concernCreator}
                            userData={userData}
                            status={status}
                            setStatus={setStatus}
                            isAssigned={isAssigned}
                            setIsAssigned={setIsAssigned}
                        />

                        <DiscussionThread
                            userData={userData}
                            concern={concern}
                            status={status}
                            setStatus={setStatus}
                        />
                    </>
                }
            </main>
            <Footer />
        </div>
    );
}

export default ViewConcern;
