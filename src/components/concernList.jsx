import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./statusBadge";
import strftime from "strftime";
import Database, { Pagination } from "../services/database";
import LoadingSpinner from "../components/loading";
import { showSuccessToast } from "./toastNotification";
import { dateDaysAgo, setTimeToLastMinute } from "../utils";

const filterOptions = {
    issueTypes: ["All", "Concern", "Request", "Complaint"],
    categories: ["All", "Enrollment", "Grades", "Laboratory", "Schedule", "Scholarship"],
    statuses: ["All", "Open", "In Progress", "On Hold", "Closed"],
};

const FilterDropdown = ({ value, onChange, options, isOpen, toggleDropdown }) => {
    const handleCheckboxChange = (option) => {
        let newValue;

        if (option === "All") {
            // If "All" is selected, check all options
            newValue = value.includes("All") ? [] : options;
        } else {
            // If any other option is selected, update accordingly
            newValue = value.includes(option)
                ? value.filter(v => v !== option)
                : [...value, option];

            // If all options except "All" are selected, include "All"
            if (newValue.length === options.length - 1 && !newValue.includes("All")) {
                newValue.push("All");
            }

            // If "All" is already selected and another option is deselected, remove "All"
            if (newValue.includes("All") && option !== "All" && newValue.length < options.length) {
                newValue = newValue.filter(v => v !== "All");
            }
        }

        onChange({ target: { value: newValue } });
    };

    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                onClick={toggleDropdown}
                className="flex items-center text-gray-700 hover:text-gray-900"
            >
                <span className="ml-1">▼</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {options.map(option => (
                            <label key={option} className="block px-4 py-1 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
                                <input
                                    type="checkbox"
                                    value={option}
                                    checked={value.includes(option)}
                                    onChange={() => handleCheckboxChange(option)}
                                    className="mr-2"
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const DateDropdown = ({ startDate, endDate, onChange, isOpen, toggleDropdown }) => (
    <div className="relative inline-block text-left">
        <button
            type="button"
            onClick={toggleDropdown}
            className="flex items-center text-gray-700 hover:text-gray-900"
        >
            <span className="ml-1">▼</span>
        </button>
        {isOpen && (
            <div className="absolute right-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none p-2">
                <div className="grid items-center justify-between mb-2">
                    <span className=" text-gray-700 font-bold">Start Date:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => onChange('startDate', e.target.value)}
                        className="bg-gray-100 border border-gray-200 rounded w-full text-xs px-2"
                    />
                </div>
                <div className="grid items-center justify-between">
                    <span className="text-xs text-gray-700 font-bold">End Date:</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => onChange('endDate', e.target.value)}
                        className="bg-gray-100 border border-gray-200 rounded w-full text-xs px-2"
                    />
                </div>
            </div>
        )}
    </div>
);

export function ConcernList({ userData, concernsFilter }) {
    const [filteredConcerns, setFilteredConcerns] = useState(undefined);
    const [filters, setFilters] = useState({
        issueType: ["All", "Concern", "Request", "Complaint"],
        category: ["All", "Enrollment", "Grades", "Laboratory", "Schedule", "Scholarship"],
        status: ["Open", "In Progress"],
        sortBy: "newest",
        startDate: strftime("%Y-%m-%d", dateDaysAgo(7)),
        endDate: strftime("%Y-%m-%d", new Date()),
    });
    const [openFilterDropdown, setOpenFilterDropdown] = useState({
        issueType: false,
        category: false,
        status: false,
        dateSubmitted: false,
    });
    const [hideLoadButton, setHideLoadButton] = useState(false);
    const pagination = useRef(new Pagination(10));

    const fetchConcerns = useCallback(async () => {
        let fetchedConcerns;
        let filteredFetchedConcerns;

        if (concernsFilter) {
            const filter = concernsFilter.copy().dateSubmittedRange(
                // `toDateString` is called to remove the time part of the date
                new Date(new Date(filters.startDate).toDateString()),

                // Firestore will filter the date with time taking into account
                // So here, we set the date's time to the last minute of the day
                // to make sure that everything on that given day will be fetched
                setTimeToLastMinute(new Date(filters.endDate))
            );
            fetchedConcerns = await Database.getConcerns(filter, pagination.current);
            filteredFetchedConcerns = fetchedConcerns
                .filter(concern => filters.issueType.includes(concern.issueType))
                .filter(concern => filters.category.includes(concern.category))
                .filter(concern => filters.status.includes(concern.status));

            setFilteredConcerns((filteredConcerns) => {
                if (filteredConcerns === undefined) return filteredFetchedConcerns;
                return [...filteredConcerns, ...filteredFetchedConcerns];
            });

            if (fetchedConcerns.length !== 0) {
                setHideLoadButton(false);

                if (filteredFetchedConcerns.length === 0) {
                    return await fetchConcerns();
                }
            }
        }

        return [fetchedConcerns, filteredFetchedConcerns];
    }, [concernsFilter, filters]);

    async function loadButton() {
        const fetchedConcerns = (await fetchConcerns())[0];

        if (fetchedConcerns.length === 0) {
            setHideLoadButton(true);
        }
    }

    useEffect(() => {
        fetchConcerns();
    }, [fetchConcerns]);

    const handleFilterChange = (filterName, value) => {
        // Filter is changed so we need to reset the pagination and concerns
        pagination.current.reset();
        setFilteredConcerns(undefined);

        setFilters(prev => ({ ...prev, [filterName]: value }));
        setOpenFilterDropdown(prev => ({ ...prev, [filterName]: false }));
    };

    const toggleFilterDropdown = (filterName) => {
        setOpenFilterDropdown(prev => ({
            ...prev,
            [filterName]: !prev[filterName],
        }));
    };

    const handleCopyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        showSuccessToast("Copied Concern ID to clipboard: " + id);
    };

    return (
        <div className="p-4">
            <div className="min-w-full">
                <div>
                    {/* Filter Section */}
                    <div
                        className="text-gray-600 border-gray-300 grid text-xs sticky top-0 bg-white z-10"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: userData?.isAdmin()
                            ? '2.5fr 2.5fr 4fr 4fr 2.5fr 2.5fr 2fr'
                            : '2fr 2fr 2fr 2fr 2fr',
                            alignItems: 'center',
                        }}
                    >
                        <div className="py-3 px-4 flex items-left">
                            <div className="font-bold mr-2 ml-5">Type of Issue</div>
                            <FilterDropdown
                                value={filters.issueType}
                                onChange={e => handleFilterChange('issueType', e.target.value)}
                                options={filterOptions.issueTypes}
                                isOpen={openFilterDropdown.issueType}
                                toggleDropdown={() => toggleFilterDropdown('issueType')}
                            />
                        </div>
                        <div className="py-3 px-4 flex items-left">
                            <div className="font-bold mr-2">Category</div>
                            <FilterDropdown
                                value={filters.category}
                                onChange={e => handleFilterChange('category', e.target.value)}
                                options={filterOptions.categories}
                                isOpen={openFilterDropdown.category}
                                toggleDropdown={() => toggleFilterDropdown('category')}
                            />
                        </div>
                        <div className="py-3 px-4">
                            <div className="font-bold">Subject/Title</div>
                        </div>
                        {userData?.isAdmin() && (
                            <div className="py-3 px-4 flex items-left">
                                <div className="font-bold mr-2">Assigned</div>
                            </div>
                        )}
                        <div className="py-3 px-4 flex items-left">
                            <div className="font-bold mr-2">Status</div>
                            <FilterDropdown
                                value={filters.status}
                                onChange={e => handleFilterChange('status', e.target.value)}
                                options={filterOptions.statuses}
                                isOpen={openFilterDropdown.status}
                                toggleDropdown={() => toggleFilterDropdown('status')}
                            />
                        </div>
                        <div className="py-3 px-4 flex items-left">
                            <div className="font-bold mr-2">Date Submitted</div>
                            <DateDropdown
                                startDate={filters.startDate}
                                endDate={filters.endDate}
                                onChange={handleFilterChange}
                                isOpen={openFilterDropdown.dateSubmitted}
                                toggleDropdown={() => toggleFilterDropdown('dateSubmitted')}
                            />
                        </div>
                    </div>

                    {/* Concern List */}
                    {
                        filteredConcerns === undefined ?

                        <div className="flex justify-center">
                            <LoadingSpinner />
                        </div> :

                        filteredConcerns.length > 0 ? <>
                            {filteredConcerns.map(concern => (
                                <Link
                                    to={`/view-concern/${concern.uid}`}
                                    key={concern.uid}
                                    className="text-gray-700 border border-gray-300 mb-2 grid text-sm rounded-md hover:shadow hover:bg-gray-100"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: userData?.isAdmin()
                                        ? '2.5fr 2.5fr 4fr 4fr 2.5fr 2.5fr 2fr'
                                        : '2fr 2fr 2fr 2fr 2fr',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div className="py-2 px-4 ml-5">{concern.issueType}</div>
                                    <div className="py-2 px-4">{concern.category}</div>
                                    <div className="py-2 px-4">
                                        {concern.subject.length > 30
                                            ? `${concern.subject.substring(0, 30)}...`
                                            : concern.subject}
                                    </div>
                                    {userData?.isAdmin() && (
                                        <div className="py-2 px-4">
                                            {concern.assignedAdmins.map(admin => (
                                                <div key={admin.uid}>{admin.name}</div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="py-2 px-4">
                                        <StatusBadge status={concern.status} />
                                    </div>
                                    <div className="py-2 px-4">{concern.dateSubmitted.toLocaleDateString()}</div>
                                    {userData.isAdmin() && (
                                        <div className="py-2 px-2 relative">
                                            <span
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleCopyToClipboard(concern.uid);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 cursor-pointer ml-7"
                                            >
                                                Copy ID
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            ))}

                            {
                                hideLoadButton ? <></> :
                                <div className="flex justify-center items-center mt-4">
                                    <button
                                        className="border border-gray-300 bg-white text-slate-800 py-2 px-4 text-sm cursor-pointer hover:shadow hover:bg-gray-100"
                                        onClick={() => loadButton()}
                                    >Load More</button>
                                </div>
                            }
                        </> : (
                            <div className="text-center py-4 text-xs">No concerns available.</div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default ConcernList;
