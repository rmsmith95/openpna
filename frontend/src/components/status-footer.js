import { Box } from "@mui/material";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import XCircleIcon from "@heroicons/react/24/solid/XCircleIcon";
import { machineList } from "src/components/machine-list";
import { useMachineStatus } from "src/components/server-status";

export const StatusFooter = ({ }) => {
    const serverStatus = useMachineStatus(5000);
    const serverConnected = serverStatus?.status && serverStatus.status == "connected";
    // console.log(serverStatus)

    return (
        <Box
            sx={{
                borderTop: "1px solid #ddd",
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 3,
                bgcolor: "#fafafa",
                flexWrap: "wrap",
            }}
        >
            {/* SERVER STATUS */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                }}
            >
                {serverConnected ? (
                    <CheckCircleIcon style={{ width: 16, height: 16, color: "#2e7d32" }} />
                ) : (
                    <XCircleIcon style={{ width: 16, height: 16, color: "#d32f2f" }} />
                )}
                Server
            </Box>

            {/* MACHINE STATUS */}
            {machineList.map((m) => {
                const connected = serverStatus.machines?.[m.name] ?? false;

                return (
                    <Box
                        key={m.name}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            fontSize: 13,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {connected ? (
                            <CheckCircleIcon style={{ width: 16, height: 16, color: "#2e7d32" }} />
                        ) : (
                            <XCircleIcon style={{ width: 16, height: 16, color: "#d32f2f" }} />
                        )}
                        {m.name}
                    </Box>
                );
            })}
        </Box>
    );
};
