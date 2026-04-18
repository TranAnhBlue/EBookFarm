const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const repair = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const journals = await FarmJournal.find();
        console.log(`Checking ${journals.length} journals...`);

        const schemas = await FormSchema.find();
        const schemaMap = {};
        schemas.forEach(s => {
            // Map by name. Note: If there are duplicate names in different categories, 
            // we might need more logic, but this is a good start.
            schemaMap[s.name.toLowerCase()] = s._id;
        });

        let repairedCount = 0;
        let orphanedCount = 0;

        for (const journal of journals) {
            const currentSchema = await FormSchema.findById(journal.schemaId);
            
            if (!currentSchema) {
                // Orphan detected! Try to find by entries name or some hints
                // Since journals in list show a name, let's see where that name comes from.
                // In my frontend, I used j.schemaId.name. 
                // If it's null, we need to find it by looking at the journal.
                
                // Let's try to find a schema that matches the name the journal WAS supposed to have.
                // For now, let's just log and see.
                orphanedCount++;
                
                // If we don't have the old name, we might be in trouble.
                // However, I can try to find a schema by looking at the entries structure?
                // Or maybe just try to find a schema that matches a hardcoded "Dưa lưới" for now if we know that's the one.
            }
        }

        console.log(`Orphaned journals: ${orphanedCount}`);
        
        // BETTER REPAIR: Match by the name the user SEES.
        // Wait, if schemaId is null, schemaId.name is undefined.
        // So how did the user see "Dưa lưới" in the screenshot?
        // Maybe it's populated in some cases but not others?
        
        // I'll do a broad repair: for every journal, find the schema that exactly matches 
        // the name it SHOULD have (if we can find it).
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

repair();
