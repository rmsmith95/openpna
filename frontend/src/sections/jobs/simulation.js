import { useState, useCallback, useRef } from 'react';
import { initialJobs, initialParts } from '../../utils/jobs-set1';

export const useSimulation = ({ jobs, setJobs, parts, setParts, intervalTime = 1000 }) => {
  const [currentJobId, setCurrentJobId] = useState(null);
  const intervalRef = useRef(null);

  // --- Manual single step ---
  const step = useCallback(() => {
    const nextJob = jobs.find(j => j.status === 'To Do');
    if (!nextJob) {
      setCurrentJobId(null);
      return;
    }

    setCurrentJobId(nextJob.id);

    setJobs(prev =>
      prev.map(j => j.id === nextJob.id ? { ...j, status: 'Done' } : j)
    );
    setParts(prev =>
      prev.map(p => p.name === nextJob.part ? { ...p, assembled: true } : p)
    );

    setTimeout(() => setCurrentJobId(null), 500);
  }, [jobs, setJobs, setParts]);

  // --- Automatic run loop ---
  const run = useCallback(() => {
    if (intervalRef.current) return; // already running

    intervalRef.current = setInterval(() => {
      setJobs(prevJobs => {
        const nextJob = prevJobs.find(j => j.status === 'To Do');
        if (!nextJob) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setCurrentJobId(null);
          return prevJobs;
        }

        setCurrentJobId(nextJob.id);

        // update parts
        setParts(prevParts =>
          prevParts.map(p =>
            p.name === nextJob.part ? { ...p, assembled: true } : p
          )
        );

        setTimeout(() => setCurrentJobId(null), 500);

        // update jobs
        return prevJobs.map(j =>
          j.id === nextJob.id ? { ...j, status: 'Done' } : j
        );
      });
    }, intervalTime);
  }, [setJobs, setParts, intervalTime]);

  // --- Stop automatic run ---
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setCurrentJobId(null); // optional: clear highlight
    }
  }, []);

  // --- Reset everything ---
  const reset = useCallback(() => {
    setCurrentJobId(null);
    setJobs(initialJobs.map(j => ({ ...j, status: 'To Do' })));
    setParts(initialParts.map(p => ({ ...p, assembled: false })));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [setJobs, setParts]);

  return { currentJobId, step, run, stop, reset };
};
