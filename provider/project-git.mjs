import { createHash } from 'node:crypto';
import { access, mkdir, mkdtemp, realpath, rename, rm } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import { finished } from 'node:stream/promises';
import { projectWorkspace, subscribe } from './project-process.mjs';

function githubRemote(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.port || url.username || url.password || url.search || url.hash
    || !/^\/[a-z\d_.-]+\/[a-z\d_.-]+\/?$/i.test(url.pathname)) {
    throw Error('请提供本机绝对路径或不含凭据的 HTTPS GitHub 仓库地址');
  }
  return url.origin + url.pathname.replace(/\/$/, '').replace(/\.git$/, '') + '.git';
}

export function createProjectGit(host, project) {
  const cwd = projectWorkspace(host.dataRoot);
  async function run(args, signal, allowedExit = [0]) {
    signal?.throwIfAborted();
    await mkdir(cwd, {recursive: true});
    const process = await host.runtime.subprocess.spawn({
      command: 'git',
      args: ['-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=' + (globalThis.process.platform === 'win32' ? 'NUL' : '/dev/null'), ...args],
      cwd,
      env: {GIT_TERMINAL_PROMPT: '0', GIT_LFS_SKIP_SMUDGE: '1', GIT_CONFIG_COUNT: '0'},
    });
    let stop, failure, bytes = 0;
    const end = error => { failure ??= error; stop ??= Promise.resolve().then(() => process.kill()); void stop.catch(() => {}); };
    const abort = () => end(signal.reason);
    const chunks = [];
    const stdout = subscribe(process.stdout, chunk => {
      if (failure) return;
      const data = Buffer.from(chunk);
      bytes += data.length;
      if (bytes > 64 * 1024 * 1024) end(Error('Git 返回的数据过多'));
      else chunks.push(data);
    }, end);
    const stderr = process.stderr ? subscribe(process.stderr, () => {}, end) : () => {};
    // DSH can observe process exit before the last Windows pipe read completes.
    const drained = process.stdout.on ? finished(process.stdout, {cleanup: true}) : Promise.resolve();
    void drained.catch(end);
    signal?.addEventListener('abort', abort, {once: true});
    if (signal?.aborted) abort();
    try {
      process.stdin?.end?.();
      const result = await process.wait();
      await drained;
      await stop;
      if (failure) throw failure;
      const code = result.exitCode ?? result.code;
      if (!allowedExit.includes(code)) throw Error('Git 命令失败（退出码 ' + code + '）');
      return Buffer.concat(chunks).toString('utf8').trimEnd();
    } finally {
      signal?.removeEventListener('abort', abort);
      stdout();
      stderr();
    }
  }

  async function checkout(source, directory, signal) {
    if (isAbsolute(source)) {
      const top = await run(['-C', source, 'rev-parse', '--show-toplevel'], signal);
      return project.request('resolveRoot', [source, top], signal);
    }
    const url = githubRemote(source);
    const managed = join(directory, 'repos', createHash('sha256').update(url).digest('hex'));
    await mkdir(dirname(managed), {recursive: true});
    try {
      await access(managed);
      if (await run(['-C', managed, 'config', '--get', 'remote.origin.url'], signal) !== url) throw Error('已有托管检出的来源不匹配');
      return await realpath(managed);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }

    signal?.throwIfAborted();
    const temp = await mkdtemp(join(dirname(managed), '.clone-'));
    try {
      try {
        await run(['clone', '--no-checkout', '--no-recurse-submodules', '--', url, temp], signal);
        const names = await run(['-C', temp, 'config', '--name-only', '--get-regexp', '^filter\\..*\\.(clean|smudge|process|required)$'], signal, [0, 1]);
        const overrides = names.split(/\r?\n/).filter(Boolean).flatMap(key => ['-c', key + (key.endsWith('.required') ? '=false' : '=')]);
        await run(['-C', temp, ...overrides, '-c', 'submodule.recurse=false', 'checkout', '--force', 'HEAD', '--', '.'], signal);
      } catch {
        signal?.throwIfAborted();
        throw Error('无法获取游戏仓库，请确认本机 Git 可以访问该地址。');
      }
      signal?.throwIfAborted();
      await rename(temp, managed);
    } finally { await rm(temp, {recursive: true, force: true}); }
    return realpath(managed);
  }

  const head = (root, signal) => run(['-C', root, 'rev-parse', '--verify', 'HEAD^{commit}'], signal);
  async function snapshot(root, signal) {
    const commit = await head(root, signal);
    const [origin, tree] = await Promise.all([
      run(['-C', root, 'config', '--get', 'remote.origin.url'], signal, [0, 1]),
      run(['-C', root, 'ls-tree', '-rz', commit, '--', 'public', 'art-references'], signal),
    ]);
    return {head: commit, origin, tree};
  }
  return {checkout, head, snapshot};
}
