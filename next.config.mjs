/** @type {import('next').NextConfig} */

const nextConfig = {
    /* config options here */
    images: {
        domains: [
            'cdn-images.dzcdn.net'
        ]
    }
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
