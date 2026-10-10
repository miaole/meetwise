# P3 — Gate probes（Line AD · Branch B′ re-attest ×1 · pre-trio · no key values printed）

**Captured**: 2026-10-06 13:05:16 CST（Asia/Shanghai）· HEAD `880f14408dda9a9cb03737b811b6005d94c3a2dc` · `git status --porcelain` = 0 lines
**Worktree**: `/workspace/meetwise-lineAD` · branch `line/ad-g7-key-blocked-residual`

## Session（bare）

```
uid=1000(box) gid=1000(box) groups=1000(box),997(orbitd)
srw-rw---- 1 root docker 0 Oct  5 23:10 /var/run/docker.sock
docker:x:102:box                       # getent group docker — pre-existing membership
docker info → exit=1 · first line "Client:" · "ERROR: permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock ..."
```

## Under `./scripts/with-docker-session.sh`（AC code `160c30c` · blob `0130fb466e57`）

```
with-docker-session: docker.sock permission gap in session; re-exec via sg docker (membership already in /etc/group; no grant/chmod/sudo)
uid=1000(box) gid=102(docker) groups=102(docker),997(orbitd),1000(box)
srw-rw---- 1 root docker 0 Oct  5 23:10 /var/run/docker.sock   # unchanged · Ban chmod/setfacl/sudo/usermod
docker info → exit=0 · first line "Client:" · " Server Version: 26.1.5+dfsg1"
```

## Key presence（presence only · values never printed · Ban fingerprint）

| Scope | `MODEL_API_KEY` | `MODEL_BASE_URL` |
|-------|-----------------|------------------|
| Ambient box shell | **set**（ambient — hence mandatory strip） | unset |
| `with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL …`（exact trio form） | **unset** | **unset** |

`.env*` files: **none** exist in the worktree（`git ls-files` + `find` by name only · contents never read）. Note `scripts/run-e2e.mjs:16` / `scripts/run-e2e-ui.mjs:24` would load a root `.env` if present — absence confirmed, so the stripped Key cannot be re-injected from disk.

## Reading

env-gap class remains **cleared via Path A**（pre-existing docker membership activated by `sg` · Ban self-grant）for this host/session class. Keys stripped ⇒ Key gate must fire. Ban live.

*P3 gate probes · Line AD · 2026-10-06 13:05 CST · STOP*
