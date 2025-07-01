import React from 'react';
import Hero from '@/pages/Home/PageSections/Hero';
import Layout from '@/components/layouts/MainLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchPing } from '@/api/axiosBase';
import { toast } from 'react-toastify';

const Home: React.FC = () => {
    const { isPending, error, data } = useQuery({
        queryKey: ['ping'],
        queryFn: fetchPing
    })

    console.log(data)

    if (error) toast.error("Server Not Available")

    return (
        <Layout>
            <div className="max-w-xl mx-auto p-6 space-y-6">
                <Hero />
                {isPending && <div>Loading...</div>}
            </div>
        </Layout>

    );
};

export default Home;

