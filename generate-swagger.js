const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'src', 'modules');

function traverseDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath, callback);
    } else if (fullPath.endsWith('.router.ts') || fullPath.endsWith('.routes.ts') ) {
      callback(fullPath);
    }
  });
}

function processRouterFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if we already marked this file at the top or if it's already heavily customized
  // We'll just look for standard routes.

  const folderName = path.basename(path.dirname(filePath));
  const tagName = folderName.charAt(0).toUpperCase() + folderName.slice(1);

  // We should make sure the file has the tag definition at the top if not present
  if (!content.includes('@swagger') && !content.includes('tags:')) {
    const tagDoc = `
/**
 * @swagger
 * tags:
 *   name: ${tagName}
 *   description: API operations for ${tagName}
 */
`;
    // Insert after imports (crudely after the last import)
    const importRegex = /^import .*;/gm;
    let lastImportMatch;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      lastImportMatch = match;
    }

    if (lastImportMatch) {
      const insertIdx = lastImportMatch.index + lastImportMatch[0].length;
      content = content.slice(0, insertIdx) + '\n' + tagDoc + content.slice(insertIdx);
    } else {
      content = tagDoc + content;
    }
  }

  // Regex to find route definitions: router.<method>("/path", ...
  // e.g. router.get("/all", authController.xxx)
  const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g;
  
  let modifiedContent = "";
  let lastIndex = 0;
  let matchRoute;

  while ((matchRoute = routeRegex.exec(content)) !== null) {
    const method = matchRoute[1];
    const rawPath = matchRoute[2];
    
    // Check if there's a comment right before this match
    const stringBefore = content.substring(lastIndex, matchRoute.index);
    if (stringBefore.trimEnd().endsWith("*/")) {
      // Already has a comment block above it, skip
      modifiedContent += stringBefore + matchRoute[0];
      lastIndex = routeRegex.lastIndex;
      continue;
    }

    // Determine path variable replacements e.g. /:id to /{id}
    const swaggerPath = rawPath.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');

    // Extract path params from raw path to add them to swagger
    const pathParams = [];
    const paramRegex = /:([a-zA-Z0-9_]+)/g;
    let pMatch;
    while ((pMatch = paramRegex.exec(rawPath)) !== null) {
      pathParams.push(pMatch[1]);
    }

    let parametersYaml = "";
    if (pathParams.length > 0) {
      parametersYaml = `\n *     parameters:`;
      pathParams.forEach(p => {
        parametersYaml += `\n *       - in: path\n *         name: ${p}\n *         required: true\n *         schema:\n *           type: string`;
      });
    }

    // Basic Swagger Block
    const docBlock = `
/**
 * @swagger
 * /api/v1/${folderName}${swaggerPath === '/' ? '' : swaggerPath}:
 *   ${method}:
 *     summary: ${method.toUpperCase()} endpoint for ${folderName}
 *     tags: [${tagName}]
 *     security:
 *       - bearerAuth: []${parametersYaml}
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
`;
    
    modifiedContent += stringBefore + docBlock.trimEnd() + '\n' + matchRoute[0];
    lastIndex = routeRegex.lastIndex;
  }

  modifiedContent += content.substring(lastIndex);

  if (modifiedContent !== content) {
    fs.writeFileSync(filePath, modifiedContent, 'utf-8');
    console.log(`Updated: ${filePath}`);
  }
}

console.log("Starting Swagger auto-generation...");
traverseDir(modulesDir, processRouterFile);
console.log("Done!");
