import * as fs from 'fs';
import * as path from 'path';

const knowledgeFiles = [
    '/home/ubuntu/CTO_Agent_Masters_Curriculum.md',
    '/home/ubuntu/PM_Agent_Masters_Curriculum.md',
    '/home/ubuntu/EM_Agent_Masters_Curriculum.md',
    '/home/ubuntu/LE_Agent_Masters_Curriculum.md',
    '/home/ubuntu/CEO_Agent_Masters_Curriculum.md',
    '/home/ubuntu/Agent_Training_Case_Studies.md',
    '/home/ubuntu/TDAI_Genesis_Codex.md',
];

function loadKnowledgeBase() {
    console.log("Starting knowledge base loading simulation...");
    let allFilesExist = true;

    for (const filePath of knowledgeFiles) {
        if (fs.existsSync(filePath)) {
            console.log(`✅ Found knowledge file: ${path.basename(filePath)}`);
        } else {
            console.error(`❌ Missing knowledge file: ${filePath}`);
            allFilesExist = false;
        }
    }

    if (allFilesExist) {
        console.log("\nKnowledge base loading successful!");
        console.log("All 7 core knowledge documents are now indexed in Pinecone (simulated).");
        console.log("The system is ready for agent initialization and RAG-based recommendations.");
    } else {
        console.error("\nKnowledge base loading failed. Please ensure all files are present.");
        process.exit(1);
    }
}

loadKnowledgeBase();
