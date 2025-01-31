import { useState } from 'react';
import StatusBadge from './statusBadge';
import { FaPaperclip } from 'react-icons/fa';
import { showSuccessToast, showWarningToast } from './toastNotification';

const ConcernDetails = ({ concern, concernCreator, userData, status, setStatus, isAssigned, setIsAssigned }) => {
    const [isResolved, setIsResolved] = useState(concern.isResolved);
    const [isSpam, setIsSpam] = useState(concern.isSpam);

    const handleUnassignAdmin = () => {
        setIsAssigned(false);
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
    };

    const handleMarkAsResolved = () => {
        if (concern.isResolved === true) {
            showWarningToast('Concern is already marked as resolved.');
            return;
        }

        // Close only if concern creator is the one marking it as resolved
        if (concernCreator === userData) {
            setIsResolved(true);
            concern.setAsResolved('Closed', concernCreator, userData);
            showSuccessToast('Concern marked as resolved.');
            setStatus('Closed');
        } else {
            concern.hasBeenResolvedByAdmin = true;
            showSuccessToast('Concern marked as resolved, awaiting student confirmation.');
        }

        setIsSpam(false);

        if (!concern.isAdminAssigned(userData) && userData.isAdmin()) {
            setIsAssigned(true);
        }

        concern.saveToDatabase();

    };

    const handleMarkAsSpam = () => {
        if (concern.isSpam === true) {
            showWarningToast('Concern is already marked as spam.');
            return;
        }

        setIsResolved(false);
        setIsSpam(true);
        setStatus('Closed');

        concern.setAsResolved(false);
        concern.setIsSpam(true);
        concern.updateStatus('Closed');

        if (!concern.isAdminAssigned(userData)) {
            setIsAssigned(true);
        }

        concern.saveToDatabase();
        showSuccessToast('Concern marked as spam.');
    };

    return (
        <div className="flex flex-col mx-14 gap-4">
            <div className="flex justify-between items-center gap-4">
                <h2 className="text-3xl font-semibold">{concern.subject}</h2>

                {
                    !isAssigned ? null :
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        onClick={handleUnassignAdmin}
                    >
                        Unassign Concern
                    </button>
                }
            </div>
            <div className="flex justify-start gap-8">
                <div className="text-gray-600 flex items-center gap-2">
                    Concern ID <strong>#{concern.uid}</strong>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-600">Status:</span>
                    {userData?.isAdmin() ? (
                        <div className="flex items-center gap-2">
                            <select
                                value={status}
                                onChange={handleStatusChange}
                                className="border rounded p-1"
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    ) : (
                        <StatusBadge status={status} />
                    )}
                    {isResolved && (
                        <div className="text-gray-600 ml-6">
                            Flagged as <span className="font-bold ml-1">Resolved</span>
                        </div>
                    )}
                    {isSpam && (
                        <div className="text-gray-600 ml-6">
                            Flagged as <span className="font-bold ml-1">Spam</span>
                        </div>
                    )}
                </div>
            </div>

            {userData?.isAdmin() && (
                <div className="text-gray-600 flex justify-start gap-8">
                    <div>
                        <div>Student Name</div>
                        <div className="text-lg font-semibold">
                            {concernCreator?.displayName}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex border p-4 rounded-md shadow">
                <div className="flex-1 border-gray-300 pl-4">
                    <p className="text-gray-400">Date Submitted</p>
                    <div>{concern.dateSubmitted.toLocaleDateString()}</div>
                </div>
                <div className="flex-1 border-l-2 border-gray-300 pl-4">
                    <p className="text-gray-400">Type of Issue</p>
                    <div>{concern.issueType}</div>
                </div>
                <div className="flex-1 border-l-2 border-gray-300 pl-4">
                    <p className="text-gray-400">Category</p>
                    <div>{concern.category}</div>
                </div>
                <div className="flex-1 border-l-2 border-gray-300 pl-4">
                    <p className="text-gray-400">Description</p>
                    <div>{concern.description}</div>
                </div>
            </div>

            <div className="mb-1">
                <h3 className="text-gray-600 mb-2">Attachments</h3>
                {concern.attachments.length > 0 ? (
                    <div className="flex gap-4 flex-wrap">
                        {concern.attachments.map((attachment, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-2 border rounded-2xl bg-gray-50 shadow-sm"
                            >
                                <FaPaperclip className="text-gray-500" />
                                <a
                                    href={attachment.url}
                                    className="text-gray-500 hover:underline"
                                    download
                                    target="_blank"
                                >
                                    {attachment.name}
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No attachments available.</p>
                )}
            </div>
            <div className="mt-2 mb-10">
                <div className="mb-2">
                    <div
                        className="text-blue-500 rounded-md hover:underline underline-offset-1 cursor-pointer"
                        onClick={handleMarkAsResolved}
                    >
                        Mark as Resolved
                    </div>
                </div>
                {userData?.isAdmin() && (
                    <div className="mb-2">
                        <div
                            className="text-blue-500 rounded-md hover:underline underline-offset-1 cursor-pointer"
                            onClick={handleMarkAsSpam}
                        >
                            Mark as Spam
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConcernDetails;
