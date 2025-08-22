import Head from 'next/head';
import ActivityDashboard from '../components/ActivityDashboard';

export default function Home() {
  return (
    <div>
      <Head>
        <title>GitHub Repository Activity Dashboard</title>
        <meta name="description" content="Track GitHub repository activity" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-100">
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            GitHub Repository Activity Dashboard
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Last 30 days of activity for hackathon-test-mcp/test-repo
          </p>
          
          <ActivityDashboard />
        </div>
      </main>
    </div>
  );
}
