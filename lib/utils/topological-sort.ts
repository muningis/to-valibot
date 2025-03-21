const topologicalSort = (
  objects: Record<string, string>,
  dependsOn: Record<string, Array<string>>
) => {
  const visited = new Set();
  const entries: Array<[string, string]> = [];

  const visit = (name: string) => {
    if (visited.has(name)) return;
    visited.add(name);
    
    const dependencies = dependsOn[name] ?? [];
    for (const dependency of dependencies) {
      visit(dependency);
    }

    entries.push([name, objects[name]!]);
  }

  Object.keys(objects).forEach(name => visit(name));

  return entries;
}

export { topologicalSort }