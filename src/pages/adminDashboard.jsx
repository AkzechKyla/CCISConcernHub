import Footer from '../components/footer';
import ConcernList from '../components/concernList';
import DashboardStats from '../components/dashboardStats';

export function AdminDashboard() {
    // Dummy metrics data
    const metricsData = {
        open: 5,
        inProgress: 3,
        onHold: 2,
        resolved: 10,
        unresolved: 1,
        totalConcerns: 21,
    };

    // Dummy concern data
    const concerns = [
        {
            id: 1,
            issueType: 'Concern',
            category: 'Website',
            subject: 'Website is down',
            status: 'Closed',
            dateSubmitted: '2024-10-20',
            studentName: 'John Doe'
        },
        {
            id: 2,
            issueType: 'Complaint',
            category: 'Registration',
            subject: 'Late Registration Issue',
            status: 'In Progress',
            dateSubmitted: '2024-10-21',
            studentName: 'Jane Smith'
        },
    ];

    return (
        <div>
            <main className="container mx-auto p-4">
                <h2 className="text-2xl font-semibold mt-2 text-blue-400">Concern Overview</h2>
                <DashboardStats metrics={metricsData} />
                <h2 className="text-xl font-semibold mt-6 text-blue-400">Manage Concerns</h2>
                <ConcernList concerns={concerns} />
            </main>
            <Footer />
        </div>
    );
}

export default AdminDashboard;
