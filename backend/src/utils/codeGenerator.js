// utils/codeGenerator.js
const fs = require('fs');
const path = require('path');

const generateModel = (moduleName, fields) => {
  try {
    const modelTemplate = `
const mongoose = require('mongoose');

const ${moduleName.toLowerCase()}Schema = new mongoose.Schema({
  ${fields.map(field => {
    let fieldDef = `${field.name}: { type: ${field.dataType}`;
    if (field.isRequired) fieldDef += ', required: true';
    if (field.isUnique) fieldDef += ', unique: true';
    if (field.dataType === 'ObjectId' && field.ref) fieldDef += `, ref: '${field.ref}'`;
    fieldDef += ' }';
    return fieldDef;
  }).join(',\n  ')}
}, { timestamps: true });

module.exports = mongoose.model('${moduleName}', ${moduleName.toLowerCase()}Schema);
`;

    const modelsDir = path.join(__dirname, '../models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
    
    const modelPath = path.join(modelsDir, `${moduleName}.js`);
    fs.writeFileSync(modelPath, modelTemplate.trim());
    console.log(`Model generated at: ${modelPath}`);

     // Update models index
    updateModelsIndex(moduleName);
  } catch (error) {
    console.error('Error generating model:', error);
    throw error;
  }
};

const generateSchema = (moduleName, fields) => {
  try {
    const schemaTemplate = `
const { gql } = require('apollo-server-express');

const ${moduleName.toLowerCase()}Schema = gql(\`
  type ${moduleName} {
    id: ID!
    ${fields.map(field => `${field.name}: ${mapDataTypeToGQL(field.dataType)}`).join('\n    ')}
    createdAt: String!
    updatedAt: String!
  }

  input Create${moduleName}Input {
    ${fields.map(field => `${field.name}: ${mapDataTypeToGQL(field.dataType)}${field.isRequired ? '!' : ''}`).join('\n    ')}
  }

  input Update${moduleName}Input {
    ${fields.map(field => `${field.name}: ${mapDataTypeToGQL(field.dataType)}`).join('\n    ')}
  }

  extend type Query {
    ${moduleName.toLowerCase()}s: [${moduleName}!]!
    ${moduleName.toLowerCase()}(id: ID!): ${moduleName}
  }

  extend type Mutation {
    create${moduleName}(input: Create${moduleName}Input!): ${moduleName}!
    update${moduleName}(id: ID!, input: Update${moduleName}Input!): ${moduleName}!
    delete${moduleName}(id: ID!): Boolean!
  }
\`);

module.exports = ${moduleName.toLowerCase()}Schema;
`;

    const schemasDir = path.join(__dirname, '../graphql/schemas');
    if (!fs.existsSync(schemasDir)) {
      fs.mkdirSync(schemasDir, { recursive: true });
    }
    
    const schemaPath = path.join(schemasDir, `${moduleName}Schema.js`);
    fs.writeFileSync(schemaPath, schemaTemplate.trim());
    console.log(`Schema generated at: ${schemaPath}`);
    
    // Update schema index
    updateSchemaIndex(moduleName);
    
  } catch (error) {
    console.error('Error generating schema:', error);
    throw error;
  }
};

const generateResolver = (moduleName, fields) => {
  try {
    const resolverTemplate = `
const ${moduleName} = require('../../models');

module.exports = {
  Query: {
    ${moduleName.toLowerCase()}s: async () => {
      return ${moduleName}.find();
    },
    ${moduleName.toLowerCase()}: async (_, { id }) => {
      return ${moduleName}.findById(id);
    }
  },

  Mutation: {
    create${moduleName}: async (_, { input }) => {
      const ${moduleName.toLowerCase()} = new ${moduleName}(input);
      await ${moduleName.toLowerCase()}.save();
      return ${moduleName.toLowerCase()};
    },
    
    update${moduleName}: async (_, { id, input }) => {
      const ${moduleName.toLowerCase()} = await ${moduleName}.findById(id);
      if (!${moduleName.toLowerCase()}) {
        throw new Error('${moduleName} not found');
      }
      
      Object.assign(${moduleName.toLowerCase()}, input);
      await ${moduleName.toLowerCase()}.save();
      return ${moduleName.toLowerCase()};
    },
    
    delete${moduleName}: async (_, { id }) => {
      const result = await ${moduleName}.findByIdAndDelete(id);
      return !!result;
    }
  }
};
`;

    const resolversDir = path.join(__dirname, '../graphql/resolvers');
    if (!fs.existsSync(resolversDir)) {
      fs.mkdirSync(resolversDir, { recursive: true });
    }
    
    const resolverPath = path.join(resolversDir, `${moduleName}Resolver.js`);
    fs.writeFileSync(resolverPath, resolverTemplate.trim());
    console.log(`Resolver generated at: ${resolverPath}`);
    
    // Update resolver index
    updateResolverIndex(moduleName);
    
  } catch (error) {
    console.error('Error generating resolver:', error);
    throw error;
  }
};

// Function to update schemas/index.js
const updateSchemaIndex = (moduleName) => {
  try {
    const schemaIndexPath = path.join(__dirname, '../graphql/schemas/index.js');
    
    if (!fs.existsSync(schemaIndexPath)) {
      console.error('Schema index file not found:', schemaIndexPath);
      return false;
    }
    
    let content = fs.readFileSync(schemaIndexPath, 'utf8');
    
    // Check if the schema is already imported
    const importRegex = new RegExp(`const ${moduleName.toLowerCase()}Schema = require\\(['"]\\.\\/${moduleName}Schema['"]\\)`);
    if (importRegex.test(content)) {
      console.log(`Schema for ${moduleName} already exists in index`);
      return true;
    }
    
    // Find the last require statement and add after it
    const requirePattern = /const \w+Schema = require\([^)]+\);/g;
    const requireMatches = content.match(requirePattern);
    
    if (!requireMatches || requireMatches.length === 0) {
      console.error('Could not find require statements in schema index');
      return false;
    }
    
    const lastRequire = requireMatches[requireMatches.length - 1];
    const lastRequireIndex = content.lastIndexOf(lastRequire);
    const insertIndex = content.indexOf(';', lastRequireIndex) + 1;
    
    const importStatement = `\nconst ${moduleName.toLowerCase()}Schema = require('./${moduleName}Schema');`;
    content = content.slice(0, insertIndex) + importStatement + content.slice(insertIndex);
    
    // Add to module.exports array
    const exportsMatch = content.match(/module\.exports = \[([^\]]+)\]/);
    if (exportsMatch) {
      const currentExports = exportsMatch[1];
      const newExports = currentExports + `,${moduleName.toLowerCase()}Schema`;
      content = content.replace(exportsMatch[0], `module.exports = [${newExports}]`);
    }
    
    fs.writeFileSync(schemaIndexPath, content);
    console.log(`Added ${moduleName} schema to index`);
    return true;
  } catch (error) {
    console.error('Error updating schema index:', error);
    return false;
  }
};

// Function to update graphql/index.js
const updateResolverIndex = (moduleName) => {
  try {
    const resolverIndexPath = path.join(__dirname, '../graphql/index.js');
    
    if (!fs.existsSync(resolverIndexPath)) {
      console.error('Resolver index file not found:', resolverIndexPath);
      return false;
    }
    
    let content = fs.readFileSync(resolverIndexPath, 'utf8');
    
    // Check if the resolver is already imported
    const importRegex = new RegExp(`const ${moduleName}Resolver = require\\(['"]\\.\\/resolvers\\/${moduleName}Resolver['"]\\)`);
    if (importRegex.test(content)) {
      console.log(`Resolver for ${moduleName} already exists in index`);
      return true;
    }
    
    // Add resolver import
    const resolverRequirePattern = /const \w+Resolver = require\([^)]+\);/g;
    const resolverRequireMatches = content.match(resolverRequirePattern);
    
    if (resolverRequireMatches && resolverRequireMatches.length > 0) {
      const lastResolverRequire = resolverRequireMatches[resolverRequireMatches.length - 1];
      const lastResolverRequireIndex = content.lastIndexOf(lastResolverRequire);
      const resolverInsertIndex = content.indexOf(';', lastResolverRequireIndex) + 1;
      
      const resolverImportStatement = `\nconst ${moduleName}Resolver = require('./resolvers/${moduleName}Resolver');`;
      content = content.slice(0, resolverInsertIndex) + resolverImportStatement + content.slice(resolverInsertIndex);
    } else {
      // Add after the last import if no resolver imports found
      const lastImportIndex = content.lastIndexOf("require('");
      if (lastImportIndex !== -1) {
        const importInsertIndex = content.indexOf(';', lastImportIndex) + 1;
        const resolverImportStatement = `\nconst ${moduleName}Resolver = require('./resolvers/${moduleName}Resolver');`;
        content = content.slice(0, importInsertIndex) + resolverImportStatement + content.slice(importInsertIndex);
      }
    }
    
    // Add schema import if not present
    const schemaImportRegex = new RegExp(`const ${moduleName.toLowerCase()}Schema = require\\(['"]\\.\\/schemas\\/${moduleName}Schema['"]\\)`);
    if (!schemaImportRegex.test(content)) {
      const schemaRequirePattern = /const \w+Schema = require\([^)]+\);/g;
      const schemaRequireMatches = content.match(schemaRequirePattern);
      
      if (schemaRequireMatches && schemaRequireMatches.length > 0) {
        const lastSchemaRequire = schemaRequireMatches[schemaRequireMatches.length - 1];
        const lastSchemaRequireIndex = content.lastIndexOf(lastSchemaRequire);
        const schemaInsertIndex = content.indexOf(';', lastSchemaRequireIndex) + 1;
        
        const schemaImportStatement = `\nconst ${moduleName.toLowerCase()}Schema = require('./schemas/${moduleName}Schema');`;
        content = content.slice(0, schemaInsertIndex) + schemaImportStatement + content.slice(schemaInsertIndex);
      }
    }
    
    // Update typeDefs array
    const typeDefsMatch = content.match(/const typeDefs = \[([^\]]+)\]/);
    if (typeDefsMatch) {
      const currentTypeDefs = typeDefsMatch[1];
      const newTypeDefs = currentTypeDefs + `,${moduleName.toLowerCase()}Schema`;
      content = content.replace(typeDefsMatch[0], `const typeDefs = [${newTypeDefs}];`);
    }
    
    // Update resolvers array
    const resolversMatch = content.match(/const resolvers = \[([^\]]+)\]/);
    if (resolversMatch) {
      const currentResolvers = resolversMatch[1];
      const newResolvers = currentResolvers + `,${moduleName}Resolver`;
      content = content.replace(resolversMatch[0], `const resolvers = [${newResolvers}]`);
    }
    
    fs.writeFileSync(resolverIndexPath, content);
    console.log(`Added ${moduleName} resolver to index`);
    return true;
  } catch (error) {
    console.error('Error updating resolver index:', error);
    return false;
  }
};

// Function to update models/index.js
const updateModelsIndex = (moduleName) => {
  try {
    const modelsIndexPath = path.join(__dirname, '../models/index.js');
    
    if (!fs.existsSync(modelsIndexPath)) {
      console.error('Models index file not found:', modelsIndexPath);
      return false;
    }
    
    let content = fs.readFileSync(modelsIndexPath, 'utf8');
    
    // Extract all existing model exports using regex
    const modelExports = [];
    const exportRegex = /(\w+):\s*require\('\.\/(\w+)'\)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      modelExports.push({
        key: match[1],
        value: match[2]
      });
    }
    
    // Check if module already exists
    const exists = modelExports.some(exp => exp.key === moduleName && exp.value === moduleName);
    if (exists) {
      console.log(`Model ${moduleName} already exists in index`);
      return true;
    }
    
    // Add the new module
    modelExports.push({
      key: moduleName,
      value: moduleName
    });
    
    // Sort exports alphabetically for consistency
    modelExports.sort((a, b) => a.key.localeCompare(b.key));
    
    // Rebuild the file content
    const exportLines = modelExports.map(exp => `    ${exp.key}: require('./${exp.value}')`);
    const newContent = `module.exports = {\n${exportLines.join(',\n')}\n  };`;
    
    fs.writeFileSync(modelsIndexPath, newContent);
    console.log(`Added ${moduleName} model to models/index.js`);
    return true;
    
  } catch (error) {
    console.error('Error updating models index:', error);
    return false;
  }
};

// ... rest of the functions (generateFrontendFiles, generateComponentTS, generateComponentHTML, etc.)
const generateFrontendFiles = async (moduleName, fields) => {
  try {
    const frontendDir = path.join(__dirname, '../../../fe_angular/src/app/modules/uikit/pages');
    console.log("frontendDir:", frontendDir);
    
    // Create directory if it doesn't exist (recursive creation)
    if (!fs.existsSync(frontendDir)) {
      fs.mkdirSync(frontendDir, { recursive: true });
      console.log("Created frontend directory:", frontendDir);
    }
    
    const moduleDir = path.join(frontendDir, moduleName.toLowerCase());
    console.log("moduleDir:", moduleDir);
    
    // Create module directory if it doesn't exist
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
      console.log("Created module directory:", moduleDir);
    }

    // Generate component TypeScript file
    await generateComponentTS(moduleName, fields, moduleDir);
    
    // Generate component HTML file
    await generateComponentHTML(moduleName, fields, moduleDir);
    
    // Generate component CSS file
    await generateComponentCSS(moduleName, moduleDir);
    
    // Generate service file
    await generateService(moduleName, fields);

    await generateComponentSpecTS(moduleName, moduleDir)

    updateLayoutRouting(moduleName);
    updateUikitRouting(moduleName);
    updateMenu(moduleName);
    
    console.log('Frontend files generated successfully');
    return true;
  } catch (error) {
    console.error('Error generating frontend files:', error);
    throw error;
  }
};

const generateComponentTS = async (moduleName, fields, moduleDir) => {
  const componentTemplate = `
import { Component, computed, OnInit, signal, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { TableFooterComponent } from '../table/components/table-footer/table-footer.component';
import { ${moduleName}Service, ${moduleName} } from 'src/app/core/services/${moduleName.toLowerCase()}.service';
import { TableFilterService } from '../table/services/table-filter.service';

@Component({
  selector: 'app-${moduleName.toLowerCase()}',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableFooterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './${moduleName.toLowerCase()}.component.html',
  styleUrl: './${moduleName.toLowerCase()}.component.css',
})
export class ${moduleName}Component implements OnInit {
  ${moduleName.toLowerCase()}s = signal<${moduleName}[]>([]);
  @Output() onCheck = new EventEmitter<boolean>();
  show${moduleName}Form = false;
  editing${moduleName}: ${moduleName} | null = null;
  ${moduleName.toLowerCase()}Form!: FormGroup;
  protected readonly toast = toast;

  // Pagination properties
  currentPage = signal(1);
  itemsPerPage = signal(5);
  totalItems = computed(() => this.filtered${moduleName}s().length);

  constructor(
    private ${moduleName.toLowerCase()}Service: ${moduleName}Service, 
    private filterService: TableFilterService,
    private readonly _formBuilder: FormBuilder
  ) {
    this.${moduleName.toLowerCase()}Form = this._formBuilder.group({
      ${fields.map(field => `${field.name}: ['', ${field.isRequired ? 'Validators.required' : ''}]`).join(',\n      ')}
    });

    this.load${moduleName}s();
  }

  private load${moduleName}s(): void {
    this.${moduleName.toLowerCase()}Service.get${moduleName}s().subscribe({
      next: ({ data }) => {
        this.${moduleName.toLowerCase()}s.set(data.${moduleName.toLowerCase()}s);
      },
      error: (error) => {
        this.handleRequestError(error, '${moduleName.toLowerCase()}s');
      },
    });
  }

  private handleRequestError(error: any, entity: string) {
    const msg = \`An error occurred while fetching \${entity}.\`;
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message,
      action: {
        label: 'Retry',
        onClick: () => this.load${moduleName}s(),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }

  filtered${moduleName}s = computed(() => {
    const search = this.filterService.searchField().toLowerCase();
    
    return this.${moduleName.toLowerCase()}s()
      .filter((${moduleName.toLowerCase()}) =>
        ${fields.map(field => `${moduleName.toLowerCase()}.${field.name}?.toString().toLowerCase().includes(search)`).join(' ||\n        ')}
      );
  });

  // Get paginated ${moduleName.toLowerCase()}s
  paginated${moduleName}s = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filtered${moduleName}s().slice(startIndex, endIndex);
  });

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: Event) {
    const input = value.target as HTMLInputElement;
    this.filterService.searchField.set(input.value);
  }

  public toggle(event: Event) {
    const value = (event.target as HTMLInputElement).checked;
    this.onCheck.emit(value); 
  }

  // ${moduleName} form methods
  open${moduleName}Form(${moduleName.toLowerCase()}?: ${moduleName}) {
    if (${moduleName.toLowerCase()}) {
      this.editing${moduleName} = ${moduleName.toLowerCase()};
      this.${moduleName.toLowerCase()}Form.patchValue({
        ${fields.map(field => `${field.name}: ${moduleName.toLowerCase()}.${field.name}`).join(',\n        ')}
      });
    } else {
      this.editing${moduleName} = null;
      this.${moduleName.toLowerCase()}Form.reset();
    }
    this.show${moduleName}Form = true;
  }
  
  close${moduleName}Form() {
    this.show${moduleName}Form = false;
    this.${moduleName.toLowerCase()}Form.reset();
    this.editing${moduleName} = null;
  }
  
  save${moduleName}() {
    if (this.${moduleName.toLowerCase()}Form.valid) {
      const formData = this.${moduleName.toLowerCase()}Form.value;
      
      if (this.editing${moduleName}) {
        // Update existing ${moduleName.toLowerCase()}
        this.${moduleName.toLowerCase()}Service.update${moduleName}(this.editing${moduleName}.id, formData).subscribe({
          next: () => {
            toast.success('${moduleName} updated successfully');
            this.load${moduleName}s();
            this.close${moduleName}Form();
          },
          error: (error) => {
            toast.error('Failed to update ${moduleName.toLowerCase()}', { description: error.message });
          }
        });
      } else {
        // Create new ${moduleName.toLowerCase()}
        this.${moduleName.toLowerCase()}Service.create${moduleName}(formData).subscribe({
          next: () => {
            toast.success('${moduleName} created successfully');
            this.load${moduleName}s();
            this.close${moduleName}Form();
          },
          error: (error) => {
            toast.error('Failed to create ${moduleName.toLowerCase()}', { description: error.message });
          }
        });
      }
    }
  }
  
  edit${moduleName}(${moduleName.toLowerCase()}: ${moduleName}) {
    this.open${moduleName}Form(${moduleName.toLowerCase()});
  }
  
  delete${moduleName}(${moduleName.toLowerCase()}: ${moduleName}) {
    if (confirm(\`Are you sure you want to delete this ${moduleName.toLowerCase()}?\`)) {
      this.${moduleName.toLowerCase()}Service.delete${moduleName}(${moduleName.toLowerCase()}.id).subscribe({
        next: () => {
          this.${moduleName.toLowerCase()}s.update(${moduleName.toLowerCase()}s => ${moduleName.toLowerCase()}s.filter(u => u.id !== ${moduleName.toLowerCase()}.id));
          toast.success('${moduleName} deleted successfully');
        },
        error: (error) => {
          toast.error('Failed to delete ${moduleName.toLowerCase()}', { description: error.message });
        }
      });
    }
  }
  
  ngOnInit() {}
}
`;

  const componentPath = path.join(moduleDir, `${moduleName.toLowerCase()}.component.ts`);
  fs.writeFileSync(componentPath, componentTemplate.trim());
};

const generateComponentHTML = async (moduleName, fields, moduleDir) => {
  const htmlTemplate = `
<div class="mb-4 flex justify-between">
  <div class="inline-block">
    <h3 class="text-foreground font-semibold">${moduleName}</h3>
    <div class="text-muted-foreground space-x-1 text-xs font-medium">
      <a href="" class="hover:text-primary">All ${moduleName}s:</a>
      <span class="text-foreground">{{ filtered${moduleName}s().length }}</span>
    </div>
  </div>
  <div class="inline-block space-x-4">
    <button
      class="bg-primary text-primary-foreground flex-none rounded-md px-4 py-2.5 text-xs font-semibold"
      (click)="open${moduleName}Form()">
      Add ${moduleName}
    </button>
  </div>
</div>

<div class="border-muted/20 bg-background flex min-w-full flex-col rounded-xl border p-2">
  <div class="flex flex-wrap items-center justify-between gap-2 py-3 px-5">
    <h3 class="text-muted-foreground text-sm font-medium">
      Showing {{ paginated${moduleName}s().length }} of {{ ${moduleName.toLowerCase()}s().length }} ${moduleName.toLowerCase()}s
    </h3>
    <div class="flex flex-wrap gap-2">
      <div class="flex">
        <label class="text-muted-foreground relative">
          <div class="absolute left-2.5 top-2.5">
            <svg-icon src="./assets/icons/heroicons/outline/magnifying-glass.svg" [svgClass]="'h-4 w-4'"> </svg-icon>
          </div>
          <input
            name="search"
            class="py-2 pl-8 pr-2"
            placeholder="Search ${moduleName.toLowerCase()}s"
            type="text"
            value=""
            (input)="onSearchChange($event)" />
        </label>
      </div>
    </div>
  </div>
  <div
    class="scrollbar-thumb-rounded scrollbar-track-rounded scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted grow overflow-x-auto px-5">
    <table
      class="text-muted-foreground table w-full table-auto border-collapse border-0 text-left align-middle leading-5">
      <thead class="border-muted/20 text-muted-foreground border text-xs">
        <tr>
          ${fields.map(field => `<th class="min-w-[150px]">${field.label}</th>`).join('\n          ')}
          <th class="w-[150px]">Action</th>
        </tr>
      </thead>
      <tbody>
        @for (${moduleName.toLowerCase()} of paginated${moduleName}s(); track $index) {
        <tr class="hover:bg-card/50">
          ${fields.map(field => `
          <td>
            <span class="text-muted-foreground text-sm">{{ ${moduleName.toLowerCase()}.${field.name} }}</span>
          </td>`).join('\n          ')}
          <td class="text-center">
            <div class="flex items-center space-x-5">
              <button
                (click)="edit${moduleName}(${moduleName.toLowerCase()})"
                class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-blue-600 transition-colors">
                <svg-icon src="assets/icons/heroicons/outline/pencil-square.svg" [svgClass]="'h-7 w-7'"> </svg-icon>
              </button>
              <button
                (click)="delete${moduleName}(${moduleName.toLowerCase()})"
                class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-red-600 transition-colors">
                <svg-icon src="assets/icons/heroicons/outline/trash.svg" [svgClass]="'h-7 w-7'"> </svg-icon>
              </button>
            </div>
          </td>
        </tr>
        } @empty {
        <tr>
          <td class="py-4 text-center text-sm" colspan="${fields.length + 2}">No ${moduleName.toLowerCase()}s found</td>
        </tr>
        }
      </tbody>
    </table>
  </div>
  <app-table-footer
    [currentPage]="currentPage()"
    [itemsPerPage]="itemsPerPage()"
    [totalItems]="totalItems()"
    (pageChange)="onPageChange($event)"
    (pageSizeChange)="onPageSizeChange($event)"></app-table-footer>
</div>

<!-- ${moduleName} Form Modal -->
@if (show${moduleName}Form) {
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
  <div class="w-full max-w-2xl max-h-[90vh] rounded-lg bg-white shadow-xl flex flex-col">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200">
      <h3 class="text-lg font-semibold">{{ editing${moduleName} ? 'Edit ${moduleName}' : 'Add New ${moduleName}' }}</h3>
    </div>
    
    <!-- Scrollable Form Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <form [formGroup]="${moduleName.toLowerCase()}Form" (ngSubmit)="save${moduleName}()">
        ${fields.map(field => `
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-gray-700">${field.label}</label>
          <input
            type="${getInputType(field.dataType)}"
            formControlName="${field.name}"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter ${field.label.toLowerCase()}" />
          @if (${moduleName.toLowerCase()}Form.get('${field.name}')?.invalid && ${moduleName.toLowerCase()}Form.get('${field.name}')?.touched) {
          <p class="mt-1 text-xs text-red-500">${field.label} is required</p>
          }
        </div>`).join('\n        ')}
      </form>
    </div>
    
    <!-- Fixed Footer with Buttons -->
    <div class="p-6 border-t border-gray-200 bg-gray-50">
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          (click)="close${moduleName}Form()"
          class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="!${moduleName.toLowerCase()}Form.valid"
          (click)="save${moduleName}()"
          class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300">
          {{ editing${moduleName} ? 'Update' : 'Create' }}
        </button>
      </div>
    </div>
  </div>
</div>
}
`;

  const htmlPath = path.join(moduleDir, `${moduleName.toLowerCase()}.component.html`);
  fs.writeFileSync(htmlPath, htmlTemplate.trim());
};

const generateComponentCSS = async (moduleName, moduleDir) => {
  const cssTemplate = `
/* ${moduleName} Component Styles */
th {
    font-weight: 500;
    padding: 0.625rem 1rem;
    font-weight: 500;
    font-size: 0.8125rem;
    line-height: 1.125rem;
    vertical-align: middle;
}

td {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
}
`;

  const cssPath = path.join(moduleDir, `${moduleName.toLowerCase()}.component.css`);
  fs.writeFileSync(cssPath, cssTemplate.trim());
};


const generateComponentSpecTS = async (moduleName, moduleDir) => {
  const componentTemplate = `


  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { ${moduleName}Component } from './${moduleName.toLowerCase()}.component';

  describe('${moduleName}Component', () => {
    let component: ${moduleName}Component;
    let fixture: ComponentFixture<${moduleName}Component>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [${moduleName}Component],
      }).compileComponents();

      fixture = TestBed.createComponent(${moduleName}Component);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
`;

  const componentPath = path.join(moduleDir, `${moduleName.toLowerCase()}.component.spec.ts`);
  fs.writeFileSync(componentPath, componentTemplate.trim());
};

const generateService = async (moduleName, fields) => {
  const serviceTemplate = `
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface ${moduleName} {
  id: string;
  ${fields.map(field => `${field.name}: ${getTypescriptType(field.dataType)};`).join('\n  ')}
  createdAt: string;
  updatedAt: string;
}

const GET_${moduleName.toUpperCase()}S = gql\`
  query {
    ${moduleName.toLowerCase()}s {
      id
      ${fields.map(field => field.name).join('\n      ')}
      createdAt
      updatedAt
    }
  }
\`;

const GET_${moduleName.toUpperCase()} = gql\`
  query Get${moduleName}(\$id: ID!) {
    ${moduleName.toLowerCase()}(id: \$id) {
      id
      ${fields.map(field => field.name).join('\n      ')}
      createdAt
      updatedAt
    }
  }
\`;

const CREATE_${moduleName.toUpperCase()} = gql\`
  mutation Create${moduleName}(\$input: Create${moduleName}Input!) {
    create${moduleName}(input: \$input) {
      id
      ${fields.map(field => field.name).join('\n      ')}
      createdAt
      updatedAt
    }
  }
\`;

const UPDATE_${moduleName.toUpperCase()} = gql\`
  mutation Update${moduleName}(\$id: ID!, \$input: Update${moduleName}Input!) {
    update${moduleName}(id: \$id, input: \$input) {
      id
      ${fields.map(field => field.name).join('\n      ')}
      updatedAt
    }
  }
\`;

const DELETE_${moduleName.toUpperCase()} = gql\`
  mutation Delete${moduleName}(\$id: ID!) {
    delete${moduleName}(id: \$id)
  }
\`;

@Injectable({
  providedIn: 'root'
})
export class ${moduleName}Service {
  constructor(private apollo: Apollo) {}

  get${moduleName}s(): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_${moduleName.toUpperCase()}S,
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map((result: any) => result.data?.${moduleName.toLowerCase()}s || []),
      catchError(error => {
        console.error('Error fetching ${moduleName.toLowerCase()}s:', error);
        return throwError(() => new Error('Failed to fetch ${moduleName.toLowerCase()}s'));
      })
    );
  }

  get${moduleName}(id: string): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_${moduleName.toUpperCase()},
      variables: { id },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map((result: any) => result.data?.${moduleName.toLowerCase()}),
      catchError(error => {
        console.error('Error fetching ${moduleName.toLowerCase()}:', error);
        return throwError(() => new Error('Failed to fetch ${moduleName.toLowerCase()}'));
      })
    );
  }

  create${moduleName}(input: any): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_${moduleName.toUpperCase()},
      variables: { input },
      refetchQueries: [{
        query: GET_${moduleName.toUpperCase()}S,
        fetchPolicy: 'network-only'
      }]
    }).pipe(
      map((result: any) => result.data?.create${moduleName}),
      catchError(error => {
        console.error('Error creating ${moduleName.toLowerCase()}:', error);
        return throwError(() => new Error('Failed to create ${moduleName.toLowerCase()}: ' + error.message));
      })
    );
  }

  update${moduleName}(id: string, input: any): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_${moduleName.toUpperCase()},
      variables: { id, input },
      refetchQueries: [{
        query: GET_${moduleName.toUpperCase()}S,
        fetchPolicy: 'network-only'
      }]
    }).pipe(
      map((result: any) => result.data?.update${moduleName}),
      catchError(error => {
        console.error('Error updating ${moduleName.toLowerCase()}:', error);
        return throwError(() => new Error('Failed to update ${moduleName.toLowerCase()}: ' + error.message));
      })
    );
  }

  delete${moduleName}(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_${moduleName.toUpperCase()},
      variables: { id },
      refetchQueries: [{
        query: GET_${moduleName.toUpperCase()}S,
        fetchPolicy: 'network-only'
      }]
    }).pipe(
      map((result: any) => result.data?.delete${moduleName}),
      catchError(error => {
        console.error('Error deleting ${moduleName.toLowerCase()}:', error);
        return throwError(() => new Error('Failed to delete ${moduleName.toLowerCase()}: ' + error.message));
      })
    );
  }
}
`;

  // Create services directory in the correct location
  const servicesDir = path.join(__dirname, '../../../fe_angular/src/app/core/services');
  if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir, { recursive: true });
  }
  
  const servicePath = path.join(servicesDir, `${moduleName.toLowerCase()}.service.ts`);
  fs.writeFileSync(servicePath, serviceTemplate.trim());
  console.log(`Service generated at: ${servicePath}`);
};

// Function to update Angular layout routing
const updateLayoutRouting = (moduleName) => {
  try {
    const layoutRoutingPath = path.join(__dirname, '../../../fe_angular/src/app/modules/layout/layout-routing.module.ts');
    
    if (!fs.existsSync(layoutRoutingPath)) {
      console.error('Layout routing file not found:', layoutRoutingPath);
      return false;
    }
    
    let content = fs.readFileSync(layoutRoutingPath, 'utf8');
    
    // Check if the route already exists
    const routeRegex = new RegExp(`path: '${moduleName.toLowerCase()}'`);
    if (routeRegex.test(content)) {
      console.log(`Route for ${moduleName} already exists in layout routing`);
      return true;
    }
    
    // Add import
    const importStatement = `import { ${moduleName}Component } from '../uikit/pages/${moduleName.toLowerCase()}/${moduleName.toLowerCase()}.component';`;
    
    // Find the last import statement
    const importPattern = /import {[^}]+} from '[^']+';/g;
    const importMatches = content.match(importPattern);
    
    if (importMatches && importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = content.indexOf(';', lastImportIndex) + 1;
      content = content.slice(0, insertIndex) + '\n' + importStatement + content.slice(insertIndex);
    }
    
    // Add route to routes array
    const routesMatch = content.match(/const routes: Routes = \[([\s\S]*?)\];/);
    if (routesMatch) {
      const currentRoutes = routesMatch[1];
      
      // Find the position before the last route (before redirect routes)
      const redirectIndex = currentRoutes.lastIndexOf('{ path: \'\'');
      if (redirectIndex !== -1) {
        const newRoute = `\n  {\n    path: '${moduleName.toLowerCase()}',\n    component: LayoutComponent,\n    canActivate: [AuthGuard],\n    children: [\n      { path: '', component: ${moduleName}Component }\n    ]\n  },`;
        const updatedRoutes = currentRoutes.slice(0, redirectIndex) + newRoute + currentRoutes.slice(redirectIndex);
        content = content.replace(routesMatch[0], `const routes: Routes = [${updatedRoutes}];`);
      }
    }
    
    fs.writeFileSync(layoutRoutingPath, content);
    console.log(`Added ${moduleName} route to layout routing`);
    return true;
  } catch (error) {
    console.error('Error updating layout routing:', error);
    return false;
  }
};

// Function to update Angular uikit routing
const updateUikitRouting = (moduleName) => {
  try {
    const uikitRoutingPath = path.join(__dirname, '../../../fe_angular/src/app/modules/uikit/uikit-routing.module.ts');
    
    if (!fs.existsSync(uikitRoutingPath)) {
      console.error('Uikit routing file not found:', uikitRoutingPath);
      return false;
    }
    
    let content = fs.readFileSync(uikitRoutingPath, 'utf8');
    
    // Check if the route already exists
    const routeRegex = new RegExp(`path: '${moduleName.toLowerCase()}'`);
    if (routeRegex.test(content)) {
      console.log(`Route for ${moduleName} already exists in uikit routing`);
      return true;
    }
    
    // Add import
    const importStatement = `import { ${moduleName}Component } from './pages/${moduleName.toLowerCase()}/${moduleName.toLowerCase()}.component';`;
    
    // Find the last import statement
    const importPattern = /import {[^}]+} from '[^']+';/g;
    const importMatches = content.match(importPattern);
    
    if (importMatches && importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = content.indexOf(';', lastImportIndex) + 1;
      content = content.slice(0, insertIndex) + '\n' + importStatement + content.slice(insertIndex);
    }
    
    // Add route to children array
    const childrenMatch = content.match(/children: \[([\s\S]*?)\]/);
    if (childrenMatch) {
      const currentChildren = childrenMatch[1];
      const newRoute = `\n      { path: '${moduleName.toLowerCase()}', component: ${moduleName}Component },`;
      
      // Insert before the catch-all route
      const catchAllIndex = currentChildren.indexOf('{ path: \'**\'');
      if (catchAllIndex !== -1) {
        const updatedChildren = currentChildren.slice(0, catchAllIndex) + newRoute + currentChildren.slice(catchAllIndex);
        content = content.replace(childrenMatch[0], `children: [${updatedChildren}]`);
      } else {
        const updatedChildren = currentChildren + newRoute;
        content = content.replace(childrenMatch[0], `children: [${updatedChildren}]`);
      }
    }
    
    fs.writeFileSync(uikitRoutingPath, content);
    console.log(`Added ${moduleName} route to uikit routing`);
    return true;
  } catch (error) {
    console.error('Error updating uikit routing:', error);
    return false;
  }
};

// Function to update Angular menu
const updateMenu = (moduleName) => {
  try {
    const menuPath = path.join(__dirname, '../../../fe_angular/src/app/core/constants/menu.ts');
    
    if (!fs.existsSync(menuPath)) {
      console.error('Menu file not found:', menuPath);
      return false;
    }
    
    let content = fs.readFileSync(menuPath, 'utf8');
    
    // Check if the menu item already exists
    const menuRegex = new RegExp(`label: '${moduleName}'`);
    if (menuRegex.test(content)) {
      console.log(`Menu item for ${moduleName} already exists`);
      return true;
    }
    
    // Find the items array in the Base group
    const itemsMatch = content.match(/items: \[([\s\S]*?)\]/);
    if (itemsMatch) {
      const currentItems = itemsMatch[1];
      const newMenuItem = `,\n    {\n      icon: 'assets/icons/heroicons/outline/cube.svg',\n      label: '${moduleName}',\n      route: '/${moduleName.toLowerCase()}',\n    }`;
      
      // Insert before the closing bracket of items array
      const lastItemIndex = currentItems.lastIndexOf('}');
      if (lastItemIndex !== -1) {
        const updatedItems = currentItems.slice(0, lastItemIndex + 1) + newMenuItem + currentItems.slice(lastItemIndex + 1);
        content = content.replace(itemsMatch[0], `items: [${updatedItems}]`);
      }
    }
    
    fs.writeFileSync(menuPath, content);
    console.log(`Added ${moduleName} to menu`);
    return true;
  } catch (error) {
    console.error('Error updating menu:', error);
    return false;
  }
};

// Helper functions
const getInputType = (dataType) => {
  const mapping = {
    'String': 'text',
    'Number': 'number',
    'Boolean': 'checkbox',
    'Date': 'date',
    'Array': 'text',
    'ObjectId': 'text'
  };
  return mapping[dataType] || 'text';
};

const getTypescriptType = (dataType) => {
  const mapping = {
    'String': 'string',
    'Number': 'number',
    'Boolean': 'boolean',
    'Date': 'string',
    'Array': 'string[]',
    'ObjectId': 'string'
  };
  return mapping[dataType] || 'string';
};

const mapDataTypeToGQL = (dataType) => {
  const mapping = {
    'String': 'String',
    'Number': 'Float',
    'Boolean': 'Boolean',
    'Date': 'String',
    'Array': '[String]',
    'ObjectId': 'ID'
  };
  return mapping[dataType] || 'String';
};

module.exports = {
  generateModel,
  generateSchema,
  generateResolver,
  generateFrontendFiles
};