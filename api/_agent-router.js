// Pure utility for routing errors - Safe for Edge Runtime
// NO 'fs' or 'path' imports allowed here!

/**
 * Determines the best agent and skills based on the error log and tags.
 * Derived from the intelligent-routing skill matrix.
 * 
 * @param {string} errorLog - The raw error log
 * @param {string[]} tags - User selected tags
 * @returns {object} { agent: string, skills: string[] }
 */
export function routeError(errorLog, tags = []) {
    const log = errorLog.toLowerCase();
    const allTags = tags.map(t => t.toLowerCase());

    // Default fallback
    let agent = 'debugger';
    let skills = ['systematic-debugging'];

    // Frontend Detection
    if (
        allTags.includes('preview') ||
        allTags.includes('hydration') ||
        /react|jsx|css|tailwind|component|render|dom/.test(log) ||
        /window is not defined|document is not defined/.test(log)
    ) {
        agent = 'frontend-specialist';
        skills.push('react-patterns', 'tailwind-patterns');
    }

    // Backend/API Detection
    else if (
        allTags.includes('database') ||
        /api|server|express|endpoint|status code|500|404|cors/.test(log) ||
        /database|sql|prisma|supabase|postgres/.test(log)
    ) {
        agent = 'backend-specialist';
        skills.push('api-patterns');

        if (/database|sql|prisma|supabase/.test(log)) {
            skills.push('database-design');
        }
    }
    // Backend/System/Infrastructure Detection (stronger signals)
    else if (
        /port|expose|docker|deployment|lasy\.app|8080|3000/.test(log) ||
        /deadlock|memory|heap|corruption|distributed|transaction|sql_error/.test(log) ||
        /cpp|c\+\+|\.cpp|sync_engine|orchestrator|system/.test(log) ||
        /access denied|invalid token|not exposed/.test(log)
    ) {
        agent = 'backend-specialist';
        skills.push('api-patterns');
        if (/database|sql|deadlock|transaction/.test(log)) {
            skills.push('database-design');
        }
    }

    // Deployment/DevOps
    else if (
        allTags.includes('deploy') ||
        /build|deployment|vercel|docker|pipeline/.test(log)
    ) {
        agent = 'devops-engineer';
        skills.push('deployment-procedures');
    }

    return { agent, skills };
}
