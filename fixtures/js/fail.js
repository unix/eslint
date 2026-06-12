function BuildRecord(status) {
  if (status === "active") {
    return "enabled";
  } else {
    return "paused";
  }
}

var record = BuildRecord("active");

export { record };
