import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-foreground">
          LiveSitter
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-foreground hover:bg-muted">
            Sign Up
          </Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-muted">
            Login
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;