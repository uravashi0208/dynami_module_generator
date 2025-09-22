// resolvers/module.js
const fs = require('fs');
const path = require('path');
const Module = require('../../models/Module');
const { generateModel, generateSchema, generateResolver, generateFrontendFiles } = require('../../utils/codeGenerator');

module.exports = {
  Query: {
    modules: async () => {
      try {
        const modules = await Module.find().lean();
        return modules.map(module => ({
          ...module,
          id: module._id.toString(),
          createdAt: module.createdAt.toISOString()
        }));
      } catch (error) {
        console.error('Error in modules query:', error);
        throw error;
      }
    },
    module: async (_, { name }) => {
      try {
        const module = await Module.findOne({ name }).lean();
        if (!module) return null;
        
        return {
          ...module,
          id: module._id.toString(),
          createdAt: module.createdAt.toISOString()
        };
      } catch (error) {
        console.error('Error in module query:', error);
        throw error;
      }
    }
  },

  Mutation: {
    createModule: async (_, { input }) => {
      try {
        console.log('createModule input:', JSON.stringify(input, null, 2));
        
        const { name, fields } = input;
        
        // Check if module already exists
        const existingModule = await Module.findOne({ name });
        if (existingModule) {
          throw new Error(`Module "${name}" already exists`);
        }
        
        // Create module record
        const newModule = new Module({ 
          name, 
          fields,
          createdAt: new Date()
        });
        
        const savedModule = await newModule.save();
        console.log('Module saved to database:', savedModule);
        
        try {
          // Generate backend files
          await generateModel(name, fields);
          await generateSchema(name, fields);
          await generateResolver(name, fields);
          await generateFrontendFiles(name, fields);
          console.log('Backend files generated successfully');
        } catch (genError) {
          console.error('Error generating files:', genError);
          // Rollback - delete the module if file generation fails
          await Module.findByIdAndDelete(savedModule._id);
          throw new Error(`Failed to generate files: ${genError.message}`);
        }
        
        // Return the formatted response
        return {
          id: savedModule._id.toString(),
          name: savedModule.name,
          fields: savedModule.fields,
          createdAt: savedModule.createdAt.toISOString()
        };
        
      } catch (error) {
        console.error('Error in createModule:', error.message);
        throw new Error(`Failed to create module: ${error.message}`);
      }
    },
    
    updateModule: async (_, { name, input }) => {
      try {
        const module = await Module.findOne({ name });
        if (!module) {
          throw new Error(`Module "${name}" not found`);
        }
        
        // Update fields
        if (input.fields) {
          module.fields = input.fields;
        }
        
        const updatedModule = await module.save();
        
        // Regenerate files with updated schema
        await generateModel(name, input.fields || module.fields);
        await generateSchema(name, input.fields || module.fields);
        await generateResolver(name, input.fields || module.fields);
        
        return {
          id: updatedModule._id.toString(),
          name: updatedModule.name,
          fields: updatedModule.fields,
          createdAt: updatedModule.createdAt.toISOString()
        };
      } catch (error) {
        console.error('Error in updateModule:', error);
        throw error;
      }
    },
    
    deleteModule: async (_, { name }) => {
      try {
        const module = await Module.findOne({ name });
        if (!module) {
          throw new Error(`Module "${name}" not found`);
        }
        
        await Module.deleteOne({ name });
        
        // Delete generated files
        const modelPath = path.join(__dirname, `../models/${name}.js`);
        const schemaPath = path.join(__dirname, `../schemas/${name}Schema.js`);
        const resolverPath = path.join(__dirname, `../resolvers/${name}Resolver.js`);
        
        [modelPath, schemaPath, resolverPath].forEach(filePath => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
        
        return true;
      } catch (error) {
        console.error('Error in deleteModule:', error);
        throw error;
      }
    }
  }
};