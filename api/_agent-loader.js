import fs from 'fs/promises';
import path from 'path';

const PROJECT_ROOT = process.cwd();
// Local server runs from /api, but .agent is in the root
const BASE_DIR = PROJECT_ROOT.endsWith('api') ? path.join(PROJECT_ROOT, '..') : PROJECT_ROOT;
const AGENTS_DIR = path.join(BASE_DIR, '.agent', 'agents');
const SKILLS_DIR = path.join(BASE_DIR, '.agent', 'skills');

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

// Re-export pure logic
export { routeError } from './_agent-router.js';
