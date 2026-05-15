/**
 * ERD → TypeScript validator.
 *
 * Every field listed in docs/data-models/ERD.md must exist as a property
 * (at any nesting depth) in the corresponding TypeScript type in src/types/.
 *
 * TypeScript types may have fields the ERD does not list — the ERD is a curated
 * view, not an exhaustive schema. The check is one-directional: ERD → types.
 *
 * Add new entities to ENTITY_MAP when a new type file is created.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/**
 * Maps each ERD entity name to the TypeScript type name and source file.
 * Update this map whenever a type is renamed or a new entity is added.
 */
const ENTITY_MAP = {
  SEED:  { typeName: "Seed",       file: "src/types/seed.ts"  },
  PLANT: { typeName: "Plant",      file: "src/types/plant.ts" },
  NODE:  { typeName: "PepperNode", file: "src/types/node.ts"  },
  FRUIT: { typeName: "Fruit",      file: "src/types/fruit.ts" },
  PLOT:  { typeName: "Plot",       file: "src/types/plot.ts"  },
  SOIL:  { typeName: "Soil",       file: "src/types/soil.ts"  },
};

/**
 * Parse the Mermaid erDiagram block in ERD.md.
 * Returns a map of entity name → array of field names (second token per field line).
 */
function parseERD(erdContent) {
  const mermaidMatch = erdContent.match(/```mermaid([\s\S]*?)```/);
  if (!mermaidMatch) throw new Error("No mermaid block found in ERD.md");

  const diagram = mermaidMatch[1];
  const entities = {};

  // Match entity blocks: ENTITY_NAME { ... }
  const entityRegex = /\b([A-Z_]+)\s*\{([^}]*)\}/g;
  let match;
  while ((match = entityRegex.exec(diagram)) !== null) {
    const entityName = match[1];
    const body = match[2];

    const fields = [];
    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      // Field line format: type fieldName [PK|FK] ["comment"]
      const fieldMatch = trimmed.match(/^\S+\s+(\w+)/);
      if (fieldMatch) fields.push(fieldMatch[1]);
    }

    entities[entityName] = fields;
  }

  return entities;
}

/**
 * Walk a TypeScript source file and collect every property name at any nesting depth.
 * Uses the TypeScript compiler API for accurate AST traversal.
 */
function collectProperties(filePath) {
  const program = ts.createProgram([filePath], {
    strict: true,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
  });

  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) throw new Error(`TypeScript could not load: ${filePath}`);

  const properties = new Set();

  function visit(node) {
    if (
      (ts.isPropertySignature(node) || ts.isPropertyDeclaration(node)) &&
      ts.isIdentifier(node.name)
    ) {
      properties.add(node.name.text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return properties;
}

function validate() {
  const erdPath = join(root, "docs/data-models/ERD.md");
  const erdContent = readFileSync(erdPath, "utf-8");
  const entities = parseERD(erdContent);

  const errors = [];
  let totalChecked = 0;

  for (const [entityName, fields] of Object.entries(entities)) {
    const mapping = ENTITY_MAP[entityName];

    if (!mapping) {
      errors.push(
        `ERD entity "${entityName}" has no entry in ENTITY_MAP in scripts/validate-erd.mjs — add it when a new type is created`
      );
      continue;
    }

    const filePath = join(root, mapping.file);
    const properties = collectProperties(filePath);

    for (const field of fields) {
      totalChecked++;
      if (!properties.has(field)) {
        errors.push(
          `  ✗  ERD field "${entityName}.${field}" not found in ${mapping.file} (type: ${mapping.typeName})`
        );
      }
    }
  }

  if (errors.length > 0) {
    console.error(`\nERD validation FAILED — ${errors.length} issue(s):\n`);
    for (const err of errors) console.error(err);
    console.error(
      "\nFix: update src/types/ to match ERD.md, or update ERD.md if the field was intentionally removed.\n"
    );
    process.exit(1);
  }

  console.log(
    `ERD validation passed — ${totalChecked} field(s) across ${Object.keys(entities).length} entities all found in src/types/`
  );
}

validate();
