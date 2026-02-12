// macro-recorder.js
export const MacroRecorder = () => {
  let recording = false;
  let macroJobs = []; // recorded as array
  let fileHandle = null;

  const start = async () => {
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: "macro.json",
        types: [{ description: "JSON Files", accept: { "application/json": [".json"] } }],
      });

      recording = true;
      macroJobs = [];
      console.log("Macro recording started. Saving to:", fileHandle.name);
    } catch (err) {
      console.error("File picker cancelled or failed:", err);
    }
  };

  const stop = async () => {
    recording = false;
    console.log("Macro recording stopped");
    if (fileHandle && macroJobs.length > 0) {
      await saveToFile();
    }
    return [...macroJobs];
  };

  const addJob = (job) => {
    if (recording) {
      macroJobs.push(job);
      console.log("Recorded job:", job);
    }
  };

  const saveToFile = async () => {
    if (!fileHandle) return;

    // Convert array to dict keyed by sequential numbers
    const jobsDict = {};
    macroJobs.forEach((job, index) => {
      const id = (index + 1).toString();
      jobsDict[id] = { ...job, id };
    });

    try {
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(jobsDict, null, 2));
      await writable.close();
      console.log("Macro saved to file:", fileHandle.name);
    } catch (err) {
      console.error("Error saving macro:", err);
    }
  };

  const clear = () => {
    macroJobs = [];
    console.log("Macro cleared");
  };

  const isRecording = () => recording;
  const getMacro = () => [...macroJobs];

  return { start, stop, addJob, clear, isRecording, saveToFile, getMacro };
};
