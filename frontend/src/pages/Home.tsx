import React from 'react';

import Hero from '@/components/Hero';
import Layout from '@/components/layouts/MainLayout';

const Home: React.FC = () => {
    return (
        <Layout>
            <div className="max-w-xl mx-auto p-6 space-y-6">
                <Hero />
            </div>
        </Layout>

    );
};

export default Home;

