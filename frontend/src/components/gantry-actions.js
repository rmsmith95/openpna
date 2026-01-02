export const goto = async (gotoPosition, speed) => {
  try {
    const res = await fetch("/api/tinyg/goto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...gotoPosition, speed }),
    });
    console.log("GoTo response:", await res.json());
  } catch (err) {
    console.error("GoTo error:", err);
  }
};

export async function handleUnlockToolChanger(time = 5) {
  await fetch("/api/tinyg/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time_s:time }),
  });
}

export async function gripperGoTo(position=1000, load_limit=100, speed=1000) {
  await fetch("/api/gripper/gripper_goto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ position, load_limit, speed }),
  });
}

export async function stepOpenGripper(time_s = 1, speed=1000) {
  await fetch("/api/gripper/gripper_open", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time_s, speed }),
  });
}

export async function stepCloseGripper(time_s = 1, speed=1000) {
  await fetch("/api/gripper/gripper_close", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time_s, speed }),
  });
}

export async function speedGripperUp () {
    await fetch("/api/gripper/speed_up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    });
}

export async function speedGripperDown () {
    await fetch("/api/gripper/speed_down", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    });
}

// "use client";

// import PropTypes from "prop-types";
// import { useState } from "react";
// import {
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableRow,
//   TableContainer,
//   Paper,
//   Button,
//   TextField,
//   Select,
//   MenuItem,
//   IconButton,
// } from "@mui/material";
// import { TrashIcon } from '@heroicons/react/24/solid';


// const GantryActions = ({
//   connectedTinyG,
//   goto,
//   openGripper,
//   closeGripper,
//   handleUnlockToolChanger,
// }) => {
//   const [rows, setRows] = useState([
//   ]);

//   const saveToFile = () => {
//     const json = JSON.stringify(rows, null, 2);
//     const blob = new Blob([json], { type: "application/json" });
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "gantry-actions.json";
//     a.click();

//     URL.revokeObjectURL(url);
//   };

//   const loadFromFile = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const data = JSON.parse(event.target.result);
//         if (Array.isArray(data)) {
//           setRows(data);
//         } else {
//           alert("Invalid JSON format");
//         }
//       } catch (err) {
//         alert("Failed to read JSON file");
//       }
//     };

//     reader.readAsText(file);
//   };

//   const updateRow = (index, key, value) => {
//     const updated = [...rows];
//     updated[index][key] = value;
//     setRows(updated);
//   };

//   const addRow = () => {
//     setRows([
//       ...rows,
//       { change: "Goto", name: "New", x: 0, y: 0, z: 0, time: 0 },
//     ]);
//   };

//   const removeRow = (index) => {
//     const updated = rows.filter((_, i) => i !== index);
//     setRows(updated);
//   };

//   const runAction = (row) => {
//     switch (row.change) {
//       case "Goto":
//         goto?.({ x: row.x, y: row.y, z: row.z, a: row.a ?? 0 }, 2000);
//         break;

//       case "Open":
//         openGripper?.(row.time);
//         break;

//       case "Close":
//         closeGripper?.(row.time);
//         break;

//       case "Unlock":
//         handleUnlockToolChanger?.(5);
//         break;

//       default:
//         console.warn("Unknown action:", row.change);
//     }
//   };

//   return (
//     <Stack spacing={2} alignItems="flex-start">
//       <Stack direction="row" spacing={2}>
//         <Button variant="contained" onClick={saveToFile}>
//           Download Actions
//         </Button>

//         <Button variant="outlined" component="label">
//           Load Actions
//           <input
//             type="file"
//             accept=".json"
//             hidden
//             onChange={loadFromFile}
//           />
//         </Button>
//       </Stack>
//       <Stack direction="row" spacing={2} alignItems="center">
//         <TableContainer component={Paper} sx={{ minWidth: 700 }}>
//           <Table size="small">
//             <TableBody>
//               {rows.map((row, index) => (
//                 <TableRow key={index}>

//                   {/* Action Type */}
//                   <TableCell>
//                     <Select
//                       value={row.change}
//                       size="small"
//                       fullWidth
//                       onChange={(e) =>
//                         updateRow(index, "change", e.target.value)
//                       }
//                     >
//                       <MenuItem value="Goto">Goto</MenuItem>
//                       <MenuItem value="Unlock">Unlock</MenuItem>
//                       <MenuItem value="Close">Close</MenuItem>
//                       <MenuItem value="Open">Open</MenuItem>
//                     </Select>
//                   </TableCell>

//                   {/* Name */}
//                   <TableCell>
//                     <TextField
//                       label="Name"
//                       value={row.name}
//                       size="small"
//                       onChange={(e) =>
//                         updateRow(index, "name", e.target.value)
//                       }
//                     />
//                   </TableCell>

//                   {/* Goto Fields */}
//                   {row.change === "Goto" && (
//                     <>
//                       <TableCell>
//                         <TextField
//                           label="X"
//                           type="number"
//                           value={row.x}
//                           size="small"
//                           onChange={(e) =>
//                             updateRow(index, "x", Number(e.target.value))
//                           }
//                         />
//                       </TableCell>

//                       <TableCell>
//                         <TextField
//                           label="Y"
//                           type="number"
//                           value={row.y}
//                           size="small"
//                           onChange={(e) =>
//                             updateRow(index, "y", Number(e.target.value))
//                           }
//                         />
//                       </TableCell>

//                       <TableCell>
//                         <TextField
//                           label="Z"
//                           type="number"
//                           value={row.z}
//                           size="small"
//                           onChange={(e) =>
//                             updateRow(index, "z", Number(e.target.value))
//                           }
//                         />
//                       </TableCell>
//                     </>
//                   )}

//                   {/* Open / Close options */}
//                   {(row.change === "Close" || row.change === "Open") && (
//                     <TableCell>
//                       <TextField
//                         label="Time (ms)"
//                         type="number"
//                         value={row.time}
//                         size="small"
//                         onChange={(e) =>
//                           updateRow(index, "time", Number(e.target.value))
//                         }
//                       />
//                     </TableCell>
//                   )}

//                   {/* Run Button */}
//                   <TableCell align="center">
//                     <Button
//                       variant="contained"
//                       size="small"
//                       onClick={() => runAction(row)}
//                     >
//                       Run
//                     </Button>
//                   </TableCell>

//                   {/* Delete Row */}
//                   <TableCell align="center">
//                     <IconButton
//                       color="error"
//                       onClick={() => removeRow(index)}
//                     >
//                       <TrashIcon width={20} height={20} color="red" />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}

//               {/* ADD ROW BUTTON */}
//               <TableRow>
//                 <TableCell colSpan={7} align="center" sx={{ py: 2 }}>
//                   <Button variant="outlined" onClick={addRow}>
//                     + Add Row
//                   </Button>
//                 </TableCell>
//               </TableRow>

//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Stack>
//     </Stack>
//   );
// };

// GantryActions.propTypes = {
//   onGoto: PropTypes.func,
//   onOpen: PropTypes.func,
//   onClose: PropTypes.func,
//   onUnlock: PropTypes.func,
// };

// export default GantryActions;
