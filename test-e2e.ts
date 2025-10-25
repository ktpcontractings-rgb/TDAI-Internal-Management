import { appRouter } from './server/routers';
import { db } from './server/db';

async function runTest() {
    console.log("--- Starting E2E Test Simulation ---");

    // 1. Test Data Loading
    const caller = appRouter.createCaller({});
    const agentsBefore = await caller.agents.list();
    console.log(`Agents before initialization: ${agentsBefore.length}`);
    const decisionsBefore = await caller.agents.decisions.list();
    console.log(`Pending decisions before update: ${decisionsBefore.length}`);

    // 2. Test Initialize Agent
    console.log("\n--- Initializing New Agent (LE) ---");
    const newAgent = await caller.agentReasoning.initializeAgent({ agent: 'le' });
    console.log(`Initialized Agent: ${newAgent.name} with ID ${newAgent.id}`);

    const agentsAfterInit = await caller.agents.list();
    console.log(`Agents after initialization: ${agentsAfterInit.length}`);

    // 3. Test Send Message
    console.log("\n--- Sending Message to CTO Agent ---");
    const sentMessage = await caller.agents.communications.send({
        agentId: 'cto_agent_001',
        message: 'What is the status of the Q4 cloud infrastructure budget approval?',
        direction: 'ceo_to_agent',
    });
    console.log(`Message sent: "${sentMessage.message}"`);

    const ctoMessages = await caller.agents.communications.list({ agentId: 'cto_agent_001' });
    console.log(`CTO Agent messages count: ${ctoMessages.length}`);

    // 4. Test Approve Decision
    const decisionToApprove = decisionsBefore[0];
    if (decisionToApprove) {
        console.log(`\n--- Approving Decision: ${decisionToApprove.description} ---`);
        const updatedDecision = await caller.agents.decisions.update({ decisionId: decisionToApprove.id, status: 'approved' });
        console.log(`Decision ${updatedDecision.id} status: ${updatedDecision.status}`);
    }

    const decisionsAfterUpdate = await caller.agents.decisions.list();
    console.log(`Pending decisions after approval: ${decisionsAfterUpdate.length}`);

    // 5. Test Access Genesis Codex (Success)
    console.log("\n--- Accessing Genesis Codex (Success) ---");
    const codexContent = await caller.documents.retrieve({ documentId: 'TDAI_GENESIS_CODEX', password: 'TDAI_CODEX_SECRET_PASS' });
    console.log(`Decrypted Codex Title: ${codexContent.title}`);
    console.log(`Decrypted Codex Content (snippet): ${codexContent.content.substring(0, 80)}...`);

    // 6. Test Access Genesis Codex (Failure)
    console.log("\n--- Accessing Genesis Codex (Failure) ---");
    try {
        await caller.documents.retrieve({ documentId: 'TDAI_GENESIS_CODEX', password: 'WRONG_PASSWORD' });
    } catch (error: any) {
        console.log(`Expected Error Caught: ${error.message}`);
    }

    // 7. Test RAG System
    console.log("\n--- Generating Recommendation (RAG System) ---");
    const recommendation = await caller.agentReasoning.generateRecommendation({
        agent: 'cto',
        topic: 'System Architecture',
        context: 'TDAI is scaling from Michigan to nationwide',
        businessSituation: 'Pre-seed startup, 0 revenue, need to scale fast',
    });
    console.log(`Recommendation Source: ${recommendation.source}`);
    console.log(`Recommendation: ${recommendation.recommendation.substring(0, 80)}...`);

    console.log("\n--- E2E Test Simulation Complete ---");
}

runTest().catch(console.error);
