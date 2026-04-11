export function isReadOnlyDemoMode(): boolean {
  return (
    process.env.READ_ONLY_DEMO_MODE === "1" ||
    process.env.READ_ONLY_DEMO_MODE === "true"
  );
}

export function readOnlyDemoMessage(): string {
  return "This deployment runs in read-only demo mode. Queue changes and new restaurant writes are disabled.";
}
