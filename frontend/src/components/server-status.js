import { useCallback, useEffect, useState } from "react";


export const useMachineStatus = (intervalMs = 5000) => {
    const [serverStatus, setServerStatus] = useState({
        status: "stopped",
        machines: {},
    });

    useEffect(() => {
        const fetchStatus = async () => {
            setServerStatus((prev) => ({ ...prev, status: "loading" }));
            try {
                const res = await fetch("/api/get_health");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setServerStatus({
                    status: "connected",
                    machines: data.machines || {},
                });
            } catch {
                setServerStatus({ status: "stopped", machines: {} });
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, intervalMs);

        return () => clearInterval(interval);
    }, [intervalMs]);
    // console.log(serverStatus); // true/false
    return serverStatus;
};