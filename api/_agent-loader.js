import fs from 'fs/promises';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const AGENTS_DIR = path.join(PROJECT_ROOT, '.agent', 'agents');
const SKILLS_DIR = path.join(PROJECT_ROOT, '.agent', 'skills');

/**
 * Loads the content of an agent persona file.
 * @param {string} agentName - The name of the agent (e.g., 'frontend-specialist')
 * @returns {Promise<string>} The content of the agent file or empty string if not found.
 */
export async function getAgentContext(agentName) {
    try {
        const filePath = path.join(AGENTS_DIR, `${agentName}.md`);
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        console.warn(`[AgentLoader] Agent '${agentName}' not found.`);
        return '';
    }
}

/**
 * Loads the content of a skill file.
 * @param {string} skillName - The name of the skill (e.g., 'systematic-debugging')
 * @returns {Promise<string>} The content of the SKILL.md file or empty string if not found.
 */
export async function getSkillContext(skillName) {
    try {
        const filePath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        console.warn(`[AgentLoader] Skill '${skillName}' not found.`);
        return '';
    }
}

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
