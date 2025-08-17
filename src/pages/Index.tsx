import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import VideoPlayer from "@/components/VideoPlayer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <VideoPlayer />
      </main>
    </div>
  );
};

export default Index;
