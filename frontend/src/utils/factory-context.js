import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FactoryContext = createContext();

export const FactoryProvider = ({ children }) => {
  const [parts, setParts] = useState({});
  const [jobs, setJobs] = useState({});
  const [machines, setMachines] = useState({});
  const [loading, setLoading] = useState({ parts: false, jobs: false, machines: false });
  const [gantryPosition, setGantryPosition] = useState({ X: 0, Y: 0, Z: 0, A: 0 });
  const [cameraOffset, setCameraOffset] = useState({ X: 0, Y: 0, Z: 0 });

  // Generic backend fetch helper
  const fetchData = useCallback(async (endpoint, setStateKey) => {
    setLoading(prev => ({ ...prev, [setStateKey]: true }));
    try {
      const res = await fetch(`http://127.0.0.1:8000/${endpoint}`);
      const data = await res.json();
      switch (setStateKey) {
        case 'parts':
          setParts(data || {});
          break;
        case 'jobs':
          setJobs(data || {});
          break;
        case 'machines':
          setMachines(data || {});
          break;
        default:
          console.warn(`Unknown state key: ${setStateKey}`);
      }
    } catch (err) {
      console.error(`Error fetching ${setStateKey}:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [setStateKey]: false }));
    }
  }, []);

  // Initial fetch on load
  useEffect(() => {
    fetchData('get_parts', 'parts');
    fetchData('get_jobs', 'jobs');
    fetchData('get_machines', 'machines');
  }, [fetchData]);

  return (
    <FactoryContext.Provider
      value={{
        parts,
        jobs,
        machines,
        loading,
        fetchData,
        gantryPosition,
        setGantryPosition,
        cameraOffset,
        setCameraOffset,
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
};

// Hook to use the context
export const useFactory = () => useContext(FactoryContext);
