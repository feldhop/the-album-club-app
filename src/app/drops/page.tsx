'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

interface Drop {
    drop_id: string;
    drop_date: string;
    cover_url: string;
    user_first_name: string;
    album_name: string;
    artist_name: string;
}

const fetchDrops = async (): Promise<Drop[]> => {
    // Replace with your actual API endpoint or data fetching logic
    const response = await fetch('/api/drops');
    const data: Drop[] = await response.json();
    return data;
};

const DropsPage = () => {
    const [drops, setDrops] = useState<Drop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getDrops = async () => {
            const dropsData = await fetchDrops();
            setDrops(dropsData);
            setLoading(false);
        };

        getDrops();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">All Drops</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {drops.map(drop => (
                    <div key={drop.drop_id} className="bg-gray-800 rounded-lg shadow-md p-4">
                        <Image src={drop.cover_url} alt={drop.album_name} width={400} height={400} className="rounded-lg mb-4" />
                        <h2 className="text-xl font-semibold">{drop.album_name}</h2>
                        <p className="text-gray-400">{drop.artist_name}</p>
                        <p className="text-gray-500 text-sm">Drop Date: {drop.drop_date}</p>
                        <p className="text-gray-500 text-sm">Dropped By: {drop.user_first_name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DropsPage;