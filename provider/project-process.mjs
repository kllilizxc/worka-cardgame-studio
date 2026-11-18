import { EventEmitter } from 'node:events';
import { StringDecoder } from 'node:string_decoder';
import { fileURLToPath } from 'node:url';

const workerFile = fileURLToPath(new URL('./project-worker.mjs', import.meta.url));
const errorFrom = value => Object.assign(new Error(value?.message ?? 'Project process failed'), value?.code ? { code: value.code } : {});

/** One managed process owns external project I/O. No request is replayed. */
export function createProjectProcess(host, { maxPending = 16, maxFrameBytes = 32 * 1024 * 1024, entry = workerFile } = {}) {
  if (!Number.isInteger(maxPending) || maxPending < 1 || !Number.isInteger(maxFrameBytes) || maxFrameBytes < 1) throw new TypeError('Invalid project process limits');
  let current, retired = Promise.resolve(), closed = false, sequence = 0;
  const pending = new Map(), watches = new Map();
  const subscribe = (stream, callback, onError) => {
    if (stream?.onData) return stream.onData(callback);
    if (!stream?.on) throw Error('Project process stream is unavailable');
    stream.on('data', callback);
    stream.on('error', onError);
    return () => { const off = stream.off ?? stream.removeListener; off?.call(stream, 'data', callback); off?.call(stream, 'error', onError); };
  };
  function finish(id, error, value) {
    const call = pending.get(id);
    if (!call) return;
    pending.delete(id); call.signal?.removeEventListener('abort', call.abort);
    error !== undefined ? call.reject(error) : call.resolve(value);
  }
  function reportWatch(watch, error) {
    // Watch errors are asynchronous, like fs.watch. An unobserved resource error
    // must not become an uncaught exception in the Worka host.
    for (const listener of watch.listeners('error')) { try { listener(error); } catch {} }
  }
  function fail(generation, error) {
    error ??= Error('Project process failed');
    if (generation.failed) return generation.retirement;
    generation.failed = true;
    if (current === generation) current = undefined;
    // This barrier includes a spawn that finishes after cancellation. Never
    // create a replacement while a previous managed process still exists.
    generation.retirement = generation.start.then(() => generation.process, () => generation.process).then(async process => {
      if (process) { await process.kill(); await process.wait(); }
      else await generation.previous;
    }).finally(() => { for (const stop of generation.stops) stop(); });
    // A failed cleanup cannot safely permit a new generation.
    retired = generation.retirement;
    void retired.catch(() => {});
    for (const [id, call] of pending) if (call.generation === generation) finish(id, error);
    for (const [root, set] of [...watches]) {
      for (const watch of [...set]) if (watch.generation === generation) { watch.stopped = true; set.delete(watch); reportWatch(watch, error); }
      if (!set.size && watches.get(root) === set) watches.delete(root);
    }
    return retired;
  }
  function start() {
    if (current) return current;
    const generation = { failed: false, stops: [], previous: retired, start: undefined, retirement: undefined };
    current = generation;
    generation.start = (async () => {
      await generation.previous;
      if (closed || generation.failed) throw Error('Project process is closed');
      const spawn = host?.runtime?.subprocess?.spawn;
      if (!spawn) throw Error('Managed project process is unavailable');
      const process = await spawn.call(host.runtime.subprocess, { command: globalThis.process.execPath, args: [entry], cwd: host.dataRoot, env: { NODE_OPTIONS: '' } });
      generation.process = process;
      let buffer = '', decoder = new StringDecoder('utf8');
      generation.stops.push(subscribe(process.stdout, chunk => {
        if (generation.failed) return;
        buffer += typeof chunk === 'string' ? chunk : decoder.write(Buffer.from(chunk));
        let newline;
        while ((newline = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
          if (Buffer.byteLength(line) > maxFrameBytes) { fail(generation, Error('Project process frame exceeds limit')); return; }
          let message;
          try { message = JSON.parse(line); } catch { fail(generation, Error('Invalid project process response')); return; }
          if (message && typeof message === 'object' && 'watch' in message) {
            for (const watch of watches.get(message.watch) ?? []) {
              if (watch.stopped || watch.generation !== generation) continue;
              if (message.error) reportWatch(watch, errorFrom(message.error));
              else { try { watch.listener(message.event, message.filename); } catch (error) { reportWatch(watch, error); } }
            }
          } else if (message && typeof message.id === 'number') {
            const call = pending.get(message.id);
            if (call?.generation === generation) finish(message.id, message.error ? errorFrom(message.error) : undefined, message.result);
          } else { fail(generation, Error('Invalid project process response')); return; }
        }
        if (Buffer.byteLength(buffer) > maxFrameBytes) fail(generation, Error('Project process frame exceeds limit'));
      }, error => fail(generation, error)));
      if (process.stderr) generation.stops.push(subscribe(process.stderr, () => {}, error => fail(generation, error)));
      void process.wait().then(() => fail(generation, Error('Project process exited')), error => fail(generation, error)).catch(() => {});
      return process;
    })();
    void generation.start.catch(error => { fail(generation, error); });
    return generation;
  }
  function request(method, args, signal) {
    if (closed) return Promise.reject(Error('Project process is closed'));
    if (signal?.aborted) return Promise.reject(signal.reason ?? Error('Project request cancelled'));
    if (pending.size >= maxPending) return Promise.reject(Error('Project process is busy'));
    const generation = start(), id = ++sequence;
    return new Promise((resolve, reject) => {
      const checkout = method === 'checkout';
      let sent = false;
      const abort = () => {
        if (!checkout) { fail(generation, signal.reason); return; }
        if (!sent) { finish(id, signal.reason); return; }
        void generation.process.stdin.write(JSON.stringify({ cancel: id }) + '\n')
          .catch(error => fail(generation, error));
      };
      pending.set(id, { generation, resolve, reject, signal, abort });
      signal?.addEventListener('abort', abort, { once: true });
      if (signal?.aborted) abort();
      void generation.start.then(async process => {
        if (!pending.has(id) || generation.failed) return;
        const frame = JSON.stringify({ id, method, args }) + '\n';
        if (Buffer.byteLength(frame) > maxFrameBytes) { finish(id, Error('Project request frame exceeds limit')); return; }
        sent = true;
        await process.stdin.write(frame);
      }).catch(error => { fail(generation, error); });
    });
  }
  function watch(root, _options, listener) {
    const handle = new EventEmitter();
    handle.listener = listener; handle.stopped = false;
    const set = watches.get(root) ?? new Set();
    const first = !set.size;
    watches.set(root, set); set.add(handle);
    handle.generation = current;
    handle.close = () => {
      if (handle.stopped) return;
      handle.stopped = true; set.delete(handle);
      if (!set.size) {
        watches.delete(root);
        if (!closed && current && current === handle.generation && !current.failed) void request('unwatch', [root]).catch(error => { fail(handle.generation, error); });
      }
    };
    if (first) {
      const ready = request('watch', [root]);
      handle.generation = current;
      void ready.catch(error => {
        for (const item of set) { item.stopped = true; reportWatch(item, error); }
        set.clear(); if (watches.get(root) === set) watches.delete(root);
      });
    }
    return handle;
  }
  async function close() {
    if (!closed) {
      closed = true;
      for (const set of watches.values()) for (const watch of set) watch.stopped = true;
      watches.clear();
      if (current) fail(current, Error('Project process is closed'));
    }
    await retired;
  }
  return { request, watch, close };
}
