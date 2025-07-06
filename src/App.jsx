import { useEffect } from 'react'
import Dashboard from './Dashboard';

function App() {

  useEffect(() => {
    fetch('/api/time').then(res => res.json()).then(data => {
      console.log(data.time);
    });
  }, []);

  return (
      <Dashboard />
  )
}

export default App
