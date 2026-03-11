import Resolver from '@forge/resolver';
import { storage } from '@forge/api';
import { fetch } from '@forge/api';

const resolver = new Resolver();

/**
 * Storage key helpers.
 * Config (repo, targetDir, syncEnabled) stored as JSON.
 * Token stored separately via encrypted storage.
 */
function configKey(spaceKey) {
  return `riffle:config:${spaceKey}`;
}

function tokenKey(spaceKey) {
  return `riffle:token:${spaceKey}`;
}

/**
 * Get the current config for a space.
 */
resolver.define('getConfig', async ({ payload }) => {
  const { spaceKey } = payload;
  if (!spaceKey) return { error: 'Missing spaceKey' };

  const config = (await storage.get(configKey(spaceKey))) || {};
  const hasToken = !!(await storage.getSecret(tokenKey(spaceKey)));

  return {
    repo: config.repo || '',
    targetDir: config.targetDir || '',
    syncEnabled: config.syncEnabled || false,
    hasToken,
    lastSyncTime: config.lastSyncTime || null,
  };
});

/**
 * Save the config for a space.
 * Token is stored via Forge encrypted secret storage.
 */
resolver.define('saveConfig', async ({ payload }) => {
  const { spaceKey, repo, targetDir, syncEnabled, token } = payload;
  if (!spaceKey) throw new Error('Missing spaceKey');

  // Save main config
  const existing = (await storage.get(configKey(spaceKey))) || {};
  await storage.set(configKey(spaceKey), {
    ...existing,
    repo,
    targetDir,
    syncEnabled,
  });

  // Save token only if a new one was provided
  if (token) {
    await storage.setSecret(tokenKey(spaceKey), token);
  }

  return { success: true };
});

/**
 * Test the GitHub connection with the provided (or stored) token and repo.
 */
resolver.define('testConnection', async ({ payload }) => {
  const { spaceKey, repo, token } = payload;
  if (!repo) return { success: false, error: 'No repository specified' };

  // Use provided token or fall back to stored token
  const authToken = token || (await storage.getSecret(tokenKey(spaceKey)));
  if (!authToken) {
    return { success: false, error: 'No GitHub token available. Save a token first.' };
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Riffle-Forge-App',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, fullName: data.full_name };
    }

    if (response.status === 404) {
      return { success: false, error: 'Repository not found or not accessible with this token.' };
    }
    if (response.status === 401) {
      return { success: false, error: 'Authentication failed. Check your token.' };
    }

    return { success: false, error: `GitHub API returned ${response.status}` };
  } catch (err) {
    return { success: false, error: `Request failed: ${err.message}` };
  }
});

export const handler = resolver.getDefinitions();
