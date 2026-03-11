import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Form,
  Label,
  Textfield,
  Toggle,
  Button,
  ButtonGroup,
  Text,
  SectionMessage,
  Stack,
  Inline,
  useProductContext,
} from '@forge/react';
import { invoke } from '@forge/bridge';

const MASK = '••••••••••••••••';

function SpaceSettings() {
  const context = useProductContext();
  const spaceKey = context?.extensionContext?.spaceKey;

  const [repo, setRepo] = useState('');
  const [targetDir, setTargetDir] = useState('');
  const [token, setToken] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [hasExistingToken, setHasExistingToken] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
  const [errors, setErrors] = useState({});

  // Load config on mount
  useEffect(() => {
    if (!spaceKey) return;
    invoke('getConfig', { spaceKey }).then((config) => {
      if (config) {
        setRepo(config.repo || '');
        setTargetDir(config.targetDir || '');
        setSyncEnabled(config.syncEnabled || false);
        setHasExistingToken(config.hasToken || false);
        setLastSyncTime(config.lastSyncTime || null);
      }
    });
  }, [spaceKey]);

  function validate() {
    const errs = {};
    if (!repo.trim()) errs.repo = 'Repository is required (e.g., owner/repo)';
    if (!targetDir.trim()) errs.targetDir = 'Target directory is required';
    if (!hasExistingToken && !token.trim()) errs.token = 'GitHub token is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setMessage(null);
    try {
      await invoke('saveConfig', {
        spaceKey,
        repo: repo.trim(),
        targetDir: targetDir.trim(),
        token: token.trim() || undefined, // only send if changed
        syncEnabled,
      });
      setHasExistingToken(true);
      setToken('');
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to save: ${err.message}` });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    if (!repo.trim()) {
      setMessage({ type: 'warning', text: 'Enter a repository before testing.' });
      return;
    }
    setTesting(true);
    setMessage(null);
    try {
      const result = await invoke('testConnection', {
        spaceKey,
        repo: repo.trim(),
        token: token.trim() || undefined,
      });
      if (result.success) {
        setMessage({ type: 'success', text: `✅ Connected to ${result.fullName}` });
      } else {
        setMessage({ type: 'error', text: `❌ ${result.error}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Connection test failed: ${err.message}` });
    } finally {
      setTesting(false);
    }
  }

  const syncStatus = lastSyncTime
    ? `Last synced: ${new Date(lastSyncTime).toLocaleString()}`
    : 'Never synced';

  return (
    <Stack space="space.200">
      <Text>
        Configure Riffle to sync pages from this Confluence space to a GitHub repository.
      </Text>

      <Text testId="sync-status">
        <Text as="strong">Sync status:</Text> {syncStatus}
      </Text>

      {message && (
        <SectionMessage appearance={message.type === 'success' ? 'confirmation' : message.type === 'warning' ? 'warning' : 'error'}>
          <Text>{message.text}</Text>
        </SectionMessage>
      )}

      <Stack space="space.100">
        <Label labelFor="repo">GitHub Repository</Label>
        <Textfield
          id="repo"
          placeholder="owner/repo (e.g., trusthumankind/riffle)"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          isInvalid={!!errors.repo}
        />
        {errors.repo && <Text>{errors.repo}</Text>}

        <Label labelFor="targetDir">Target Directory</Label>
        <Textfield
          id="targetDir"
          placeholder="docs/riffle"
          value={targetDir}
          onChange={(e) => setTargetDir(e.target.value)}
          isInvalid={!!errors.targetDir}
        />
        {errors.targetDir && <Text>{errors.targetDir}</Text>}

        <Label labelFor="token">GitHub Personal Access Token</Label>
        <Textfield
          id="token"
          type="password"
          placeholder={hasExistingToken ? MASK : 'ghp_xxxxxxxxxxxx'}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          isInvalid={!!errors.token}
        />
        {errors.token && <Text>{errors.token}</Text>}
        {hasExistingToken && (
          <Text>
            A token is already saved. Leave blank to keep the existing token.
          </Text>
        )}

        <Inline alignBlock="center" space="space.100">
          <Label labelFor="syncEnabled">Sync Enabled</Label>
          <Toggle
            id="syncEnabled"
            isChecked={syncEnabled}
            onChange={() => setSyncEnabled(!syncEnabled)}
          />
        </Inline>
      </Stack>

      <ButtonGroup>
        <Button
          appearance="primary"
          onClick={handleSave}
          isLoading={saving}
          isDisabled={saving || testing}
        >
          Save Settings
        </Button>
        <Button
          appearance="default"
          onClick={handleTestConnection}
          isLoading={testing}
          isDisabled={saving || testing}
        >
          Test Connection
        </Button>
      </ButtonGroup>
    </Stack>
  );
}

export default ForgeReconciler.render(() => <SpaceSettings />);
