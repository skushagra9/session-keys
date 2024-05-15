"use client"
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();
  router.push('/page')
};

export default Home;

