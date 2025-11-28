import { useEffect, useState } from 'react';

const VisitorCounter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Simulate visitor count (in production, this would connect to a real counter)
    const storedCount = localStorage.getItem('visitorCount');
    const initialCount = storedCount ? parseInt(storedCount) : Math.floor(Math.random() * 10000) + 5000;
    
    const newCount = initialCount + 1;
    localStorage.setItem('visitorCount', newCount.toString());
    
    // Animate the counter
    let current = 0;
    const increment = Math.ceil(newCount / 50);
    const timer = setInterval(() => {
      current += increment;
      if (current >= newCount) {
        setCount(newCount);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 20);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="font-mono">
        visitors: <span className="text-primary font-semibold">{count.toLocaleString()}</span>
      </span>
    </div>
  );
};

export default VisitorCounter;
