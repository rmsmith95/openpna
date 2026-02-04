import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FactoryContext = createContext();

export const FactoryProvider = ({ children }) => {
  const [parts, setParts] = useState({});
  const [jobs, setJobs] = useState({});
  const [tools, setTools] = useState({});
  const [machines, setMachines] = useState({});
  const [loading, setLoading] = useState({
    parts: false,
    jobs: false,
    machines: false,
    tools: false,
  });
  const [gantryPosition, setGantryPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0, z: 0 });

  // Map state keys to setters for cleaner fetch
  const stateSetters = {
    parts: setParts,
    jobs: setJobs,
    machines: setMachines,
    tools: setTools,
  };

  // Generic backend fetch helper
  const fetchData = useCallback(async (endpoint, setStateKey) => {
    if (!stateSetters[setStateKey]) {
      console.warn(`Unknown state key: ${setStateKey}`);
      return;
    }

    setLoading(prev => ({ ...prev, [setStateKey]: true }));
    try {
      const res = await fetch(`http://127.0.0.1:8000/${endpoint}`);
      const data = await res.json();

      console.log('factory context load:', data)
      stateSetters[setStateKey](data || {});
    } catch (err) {
      console.error(`Error fetching ${setStateKey}:`, err);
      stateSetters[setStateKey]({});
    } finally {
      setLoading(prev => ({ ...prev, [setStateKey]: false }));
    }
  }, []);


  // Initial fetch on load
  useEffect(() => {
    fetchData('get_parts', 'parts');
    fetchData('get_jobs', 'jobs');
    fetchData('get_machines', 'machines');
    fetchData('get_tools', 'tools');
  }, [fetchData]);

  return (
    <FactoryContext.Provider
      value={{
        parts,
        jobs,
        machines,
        tools,
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
