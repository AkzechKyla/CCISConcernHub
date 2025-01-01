import Footer from '../components/footer';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpg';

export function Portal() {
    const navigate = useNavigate();

    // Handlers for navigation
    const handleStudentClick = () => {
        navigate('/my-concerns');
    };

    const handleAdminClick = () => {
        navigate('/admin-dashboard');
    };

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="backdrop-blur-sm bg-blue-400 bg-opacity-30 flex-grow flex flex-col pt-16 pb-32">
                {/* Title Section */}
                <div className="text-center mt-16 mb-16">
                    <h1 className="text-4xl font-bold text-white mb-2">CCIS Concern Hub</h1>
                    <p className="text-lg text-white">Your platform for raising concerns</p>
                </div>

                {/* Portal Content Area */}
                <div className="flex-grow flex justify-center items-center">
                    <div className="bg-white bg-opacity-20 rounded-3xl p-8 w-80 shadow-3xl">
                        <h2 className="text-2xl font-semibold text-white mb-4">Welcome</h2>
                        <p className="text-md text-white mb-6">Choose your destination</p>
                        
                        {/* Buttons for Student and Admin */}
                        <div className="flex flex-col gap-4">
                            <button
                                className="w-full flex justify-center items-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                                onClick={handleStudentClick}
                            >
                                <span>Student</span>
                            </button>
                            <button
                                className="w-full flex justify-center items-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                                onClick={handleAdminClick}
                            >
                                <span>Admin</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Portal;
