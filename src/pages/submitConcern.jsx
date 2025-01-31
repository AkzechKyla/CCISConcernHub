import { useState } from 'react';
import Footer from '../components/footer';
import iconImage from '../assets/whats-next.png';
import { useNavigate } from 'react-router-dom';
import BackArrow from '../components/backArrow';
import Concern from '../models/concern';
import { LoadingButton } from '../components/loading';
import { showErrorToast } from '../components/toastNotification';

const selectOptions = {
    issueTypes: ["Concern", "Request", "Complaint"],
    categories: ["Enrollment", "Grades", "Laboratory", "Schedule", "Scholarship"],
};

const SelectDropdown = ({ id, name, value, onChange, options, defaultValue }) => (
    <select
        id={id}
        name={name}
        required
        className="border border-blue-300 rounded p-2 w-full"
        value={value}
        onChange={onChange}
    >
        <option value="">Select {defaultValue}</option>
        {options.map(option => (
            <option key={option} value={option}>{option}</option>
        ))}
    </select>
);

const SUBJECT_LIMIT = 50;
const DESCRIPTION_LIMIT = 500;

export function SubmitConcern({ userData }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        issueType: '',
        category: '',
        subject: '',
        description: '',
        attachments: [],
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        let newValue = value;

        // Limit the number of characters for subject and description
        if (name === 'subject' && value.length > SUBJECT_LIMIT) {
            newValue = value.slice(0, SUBJECT_LIMIT);
        } else if (name === 'description' && value.length > DESCRIPTION_LIMIT) {
            newValue = value.slice(0, DESCRIPTION_LIMIT);
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: files ? Array.from(files) : newValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const newConcern = new Concern({
                ...formData,
                dateSubmitted: new Date(),
                creatorUid: userData.uid,
                attachments: [],
                assignedAdmins: [],
                recentActivityDate: new Date(),
            });
            await newConcern.uploadAttachments(formData.attachments);
            await newConcern.saveToDatabase();

            navigate(`/view-concern/${newConcern.uid}`);
        } catch (error) {
            console.error('Error submitting concern:', error);
        }

        setSubmitLoading(false);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalAttach = () => {
        setFormData((prevData) => {
            const combinedFiles = [...prevData.attachments, ...uploadedFiles.map(file => file.file)];

            // Check if the combined files exceed the limit
            if (combinedFiles.length > 5) {
                // Display error message and return the previous state without updating
                setFormData((currentData) => ({
                    ...currentData,
                    errorMessage: "You can only upload a maximum of 5 files."
                }));
                return prevData; // Don't update if limit exceeded
            }

            return {
                ...prevData,
                attachments: combinedFiles,
                errorMessage: "", // Clear any previous error messages
            };
        });

        // Clear uploaded files in the modal and close it
        setUploadedFiles([]);
        setIsModalOpen(false);
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files || e.dataTransfer.files);

        // Check if the number of files exceeds the limit
        if (uploadedFiles.length + files.length > 5) {
            showErrorToast("You can only upload a maximum of 5 files.");
            return;
        }

        // Map files to an array of file objects
        const updatedFiles = files.map((file) => ({
            file,
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + "MB",
        }));

        // Update the state by combining previous files with new files, while ensuring no duplicates
        setUploadedFiles(prevFiles => {
            const allFiles = [...prevFiles, ...updatedFiles];
            const uniqueFiles = Array.from(new Set(allFiles.map(f => f.name)))
                .map(name => allFiles.find(f => f.name === name));
            return uniqueFiles;
        });
    };



    return (
        <div className="min-h-screen flex flex-col">
            {/* Main Content Area */}
            <div className="flex flex-row flex-grow bg-white bg-opacity-90 gap-32 mb-20">
                {/* Left Side: Form */}
                <div className="w-full p-4 max-w-2xl mx-10">
                    <BackArrow label='Back'/>
                    <p className="mb-6">Fill up the necessary details below:</p>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="issue-type" className="block mb-1 text-sm text-gray-600">Type of Issue <span className="text-red-600">*</span></label>
                            <SelectDropdown
                                id="issue-type"
                                name="issueType"
                                value={formData.issueType}
                                onChange={e => handleChange(e)}
                                options={selectOptions.issueTypes}
                                defaultValue="Type of Issue"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category" className="block mb-1 text-sm text-gray-600">Category <span className="text-red-600">*</span></label>
                            <SelectDropdown
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={e => handleChange(e)}
                                options={selectOptions.categories}
                                defaultValue="Category"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="subject" className="block mb-1 text-sm text-gray-600">Subject/Title <span className="text-red-600">*</span></label>
                            <input type="text" id="subject" name="subject" required className="border border-blue-300 rounded p-2 w-full mb-1" value={formData.subject} onChange={handleChange} />
                            <div className="text-xs text-gray-600">{SUBJECT_LIMIT - formData.subject.length}/{SUBJECT_LIMIT}</div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="block mb-1 text-sm text-gray-600">Description <span className="text-red-600">*</span></label>
                            <textarea id="description" name="description" required className="border border-blue-300 rounded p-2 w-full h-24" value={formData.description} onChange={handleChange} />
                            <div className="text-xs text-gray-600">{DESCRIPTION_LIMIT - formData.description.length}/{DESCRIPTION_LIMIT}</div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="attachments" className="block mb-1 text-sm text-gray-600">Attachment</label>
                            <div className="flex items-start gap-4">
                            <div className="grid content-start">
                            <button
                                type="button"
                                className="rounded-lg bg-blue-200 text-xs text-gray-600 flex items-center px-2 py-2 mb-3 mt-3 hover:bg-blue-400 transition"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <div className="mr-2">
                                    {/*Paper clip icon*/}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="gray"
                                        className="size-3"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                                        />
                                    </svg>
                                </div>
                                <div>Attach Files</div>
                            </button>

                        </div>
                        <div className="grid col-span-5 p-5 flex-grow h-full px-0.5 py-1 mb-3 mt-3 ">
                        <div>
                            <div
                                className="grid gap-1"
                                style={{
                                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                                }}
                            >
                                {formData.attachments.slice(0, 5).map((file, index) => (
                                    <div
                                        key={index}
                                        className="relative border border-gray-300 bg-gray-100 rounded-md flex items-center text-xs pl-1 p-1 hover:bg-gray-200 group"
                                    >
                                        <div className="pl-1 text-gray-600">
                                            {file.name.length > 12 ? `${file.name.substring(0, 12)}...` : file.name}
                                        </div>
                                        <div
                                            className="absolute mr-1 right-0 hidden group-hover:block"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent click event from bubbling
                                                setFormData((prevData) => {
                                                    const updatedAttachments = prevData.attachments.filter((_, i) => i !== index);
                                                    return {
                                                        ...prevData,
                                                        attachments: updatedAttachments,
                                                    };
                                                });
                                            }}
                                        >
                                            {/* Icon for X button to remove a specific attached file */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="gray"
                                                className="size-3 cursor-pointer"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18 18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
        {/* Error message */}
        {formData.errorMessage && (
            <div className="text-red-500 text-xs mt-1">
                {formData.errorMessage}
            </div>
        )}
                <LoadingButton
                    loadingState={submitLoading}
                    spinnerStroke="#ffffff"
                    type="submit"
                    className="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600 transition duration-300"
                    loadingClassName="bg-gray-500 text-white rounded py-2 px-4"
                >
                    Submit
                </LoadingButton>
                </form>
                </div>
                {/* Right Side: Icon and Information */}
                <div className="hidden md:flex sm:w-1/3 flex-col items-center justify-center max-w-2xl">
                    <img src={iconImage} alt="Icon" className="w-32 h-32 mb-4" />
                    <h3 className="text-4xl font-semibold mb-2 text-gray-500">What&apos;s Next?</h3>
                    <p className="text-center text-gray-400">
                        Check My Concerns page for the progress of your concern. A representative from the department will respond to your queries through the Concerns page.
                    </p>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h2 className="text-lg font-semibold mb-4">Attach Files</h2>
                        <p className="text-sm text-gray-600 mb-4">Upload supporting documents or images</p>
                        <div>
                        {/* Drag and Drop Area */}
                        <div
                            className="rounded border-dashed border-2 border-gray-300 bg-gray-50 p-4 mb-4 hover:bg-gray-200"
                            onClick={() => document.getElementById("fileInput").click()}
                            onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.add("bg-gray-200");
                            }}
                            onDragEnter={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.add("bg-gray-200");
                            }}
                            onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.remove("bg-gray-200");
                            }}
                            onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.remove("bg-gray-200");
                            handleFileUpload(e);
                            }}
                        >
                            <p className="flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-5 text-gray-500"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
                                />
                            </svg>
                            </p>
                            <p className="text-center text-sm text-gray-600 mt-1">
                            Click to upload or drag and drop
                            </p>
                            <p className="text-center text-sm text-gray-400">
                            JPEG, JPG, PNG, PDF, DOC, DOCX, XLSX, XLS, CSV
                            </p>
                            <p className="text-center text-xs text-gray-400 mt-3">
                            Maximum number of files: 5
                            </p>
                            <p className="text-center text-xs text-gray-400">Maximum file size: 25 MB</p>
                            <input
                            id="fileInput"
                            type="file"
                            className="hidden"
                            multiple
                            onChange={handleFileUpload}
                            />
                        </div>

                        {/* Uploaded Files */}
                            <div className="overflow-y-auto max-h-40">  {/* Add max-height and overflow */}
                            {uploadedFiles.map((file, index) => (
                                <div key={index} className="border border-gray-300 p-3 rounded-md group relative">
                                    <div className="flex space-x-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-6 h-6 text-gray-500"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                            />
                                        </svg>
                                        <span>
                                            <div className="text-gray-500 font-medium text-sm">{file.name}</div>
                                            <div className="text-xs text-gray-500">{file.size}</div>
                                        </span>
                                        <div
                                            className="absolute top-0 right-0 hidden group-hover:block"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                        </div>
                                    </div>
                                     {/* Icon for X button to remove a specific attached file INSIDE THE MODAL*/}
                                    <div className="absolute top-1 right-1 hidden group-hover:block">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="gray"
                                            className="size-3 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent click event from bubbling
                                                setUploadedFiles((prevFiles) => {
                                                    const updatedFiles = prevFiles.filter((_, i) => i !== index); // Remove file by index
                                                    return updatedFiles;
                                                });
                                            }}
                                        >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                                        d="M6 18 18 6M6 6l12 12"
                                        />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-3 text-sm">
                            <button
                                type="button"
                                className="bg-gray-200 text-gray-600 rounded py-2 px-4 hover:bg-gray-300"
                                onClick={handleModalClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={`bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600 ${
                                    uploadedFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                onClick={handleModalAttach}
                                disabled={uploadedFiles.length === 0} // Disable button if no uploaded files
                            >
                                Attach Files
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Footer Component */}
            <Footer />
        </div>
    );
}

export default SubmitConcern;
