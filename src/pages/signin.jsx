import { useNavigate } from "react-router-dom";
import Footer from '../components/footer';
import backgroundImage from '../assets/background.jpg';
import ClientUser from '../auth/clientUser';
import outlookLogo from '../assets/outlook-logo.png';

async function navigateBasedOnRole(clientUser, navigate) {
    const userData = await clientUser.getUserFromDatabase();

    if (userData.isAdmin() && userData.isStudent()) {
        navigate("/portal");
    } else if (userData.isAdmin()) {
        navigate("/admin-workspace");
    } else if (userData.isStudent()) {
        navigate("/my-concerns");
    }
}

export function SignIn({ clientUser }) {
    const navigate = useNavigate();

    if (clientUser) {
        navigateBasedOnRole(clientUser, navigate);
    }

    async function signInWithMicrosoft() {
        const clientUser = await ClientUser.signInWithMicrosoft();
        await navigateBasedOnRole(clientUser, navigate);
    }

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

                {/* Sign In Content Area */}
                <div className="flex-grow flex justify-center items-center">
                    <div className="bg-white bg-opacity-20 rounded-3xl p-8 w-80 shadow-3xl">
                        <h2 className="text-2xl font-semibold text-white mb-4">Welcome</h2>
                        <p className="text-md text-white mb-6">Please log in or sign in below</p>
                        <button onClick={signInWithMicrosoft} className="w-full flex justify-center items-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300">
                            <div className="flex items-center">
                                <div className="w-6 h-6 flex justify-center items-center rounded-full bg-white mr-2">
                                    <img
                                        src={outlookLogo}
                                        alt="Outlook Logo"
                                        className="w-4 h-4"
                                    />
                                </div>
                                <span>Login with PUP Webmail</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default SignIn;
