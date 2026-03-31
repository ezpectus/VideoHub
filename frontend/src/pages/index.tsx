import Navbar from '../components/navbar';
import Sidebar from '../components/Sidebar';
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Sidebar />

      <main className="p-4">
        <h1>Головна сторінка</h1>
      </main>
    </div>
  );
}