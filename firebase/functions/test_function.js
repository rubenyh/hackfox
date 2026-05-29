async function test() {
  // Using default firebase project name or 'demo-project' if default is unassigned in emulator.
  // We'll check the log for the exact URL, but usually it's this pattern:
  // http://127.0.0.1:5001/<project-id>/<region>/<function-name>
  const projectId = "hackfox"; // Or demo-hackfox if it defaults to demo mode
  const url = `http://127.0.0.1:5001/${projectId}/us-central1/analyzeIncident`;
  
  const body = {
    data: {
      imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400",
      incidentType: "Bache / Daño Vial"
    }
  };

  console.log(`Sending request to ${url}...`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log("Response data:", JSON.stringify(data, null, 2));
    } catch {
      console.log("Raw Response Text:", text);
    }
  } catch (error) {
    console.error("Error calling function:", error);
  }
}

test();
