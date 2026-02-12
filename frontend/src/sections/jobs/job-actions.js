
export const fetchJobsAction = async () => {
  try {
    const res = await fetch("/api/jobs/get-jobs");
    const data = await res.json();
    return data
  } catch (err) {
    console.error('Error fetching jobs:', err);
  }
}


export const addJobAction = async () => {
  try {
    const res = await fetch("/api/jobs/add-job", {method: "POST",});
    await res.json();
  } catch (err) {
    console.error("update_job error:", err);
    throw err;
  }
};


export async function updateJobAction(job) {
  console.log('job:', job)
  try {
    const res = await fetch("/api/jobs/update-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job }),
    });

    if (!res.ok) throw new Error("Failed to update job");
    await res.json();
  } catch (err) {
    console.error("update_job error:", err);
    throw err;
  }
}

export async function deleteJobAction(job_id) {
  try {
    const res = await fetch("/api/jobs/delete-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id }),
    });

    if (!res.ok) throw new Error("Failed to delete job");
    await res.json();
  } catch (err) {
    console.error("delete_job error:", err);
    throw err;
  }
}


export async function runJobAction(job_id) {
  try {
    const res = await fetch("/api/jobs/run-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id }),
    });

    if (!res.ok) throw new Error("Failed to run job");
    await res.json();
  } catch (err) {
    console.error("runJob error:", err);
    throw err;
  }
}