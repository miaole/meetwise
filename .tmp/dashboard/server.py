#!/usr/bin/env python3
"""Meetwise 战役仪表盘 v3 — 多战役实时真相版。
/data 每请求实时组装：git 真相 + LEDGER 双源（批表 271 权威水位 + 战役刀位图）。
seats/queue 为协调者维护区（state.json）。"""
import json, http.server, socketserver, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
S = os.path.join(HERE, 'state.json')

def git(*args):
    try:
        r = subprocess.run(['git', '-C', REPO, *args], capture_output=True, text=True, timeout=10)
        return r.stdout.strip()
    except Exception:
        return ''

def parse_ledger():
    """双源解析：批表 271 水位 + 战役刀位图。"""
    batches, done, total, knives = [], 0, 0, []
    try:
        led = open(os.path.join(REPO, 'ai-docs/delivery/harness/product-campaign-LEDGER.md'), encoding='utf-8').read()
        for m in re.finditer(r'^\| (批[0-5]|HA 门) \| \*\*(\d+)/(\d+)', led, re.M):
            name, dn, tt = m.group(1), int(m.group(2)), int(m.group(3))
            nm = {'批0': '批0 阻断', '批1': '批1 主路径', '批2': '批2 AI', '批3': '批3 B端',
                  '批4': '批4 隐私', '批5': '批5 工程'}.get(name, name)
            batches.append({'n': nm, 'd': dn, 't': tt})
            done += dn; total += tt
        # 战役刀位图节（| 轨 | 刀 | 覆盖 | 状态 |）
        sec = re.search(r'## AG 能力修复\+计费改造 战役刀位图.*?\n(.*?)(?=\n## |\Z)', led, re.S)
        if sec:
            for m in re.finditer(r'^\| ([^|]+?) \| ([^|]+?) \| ([^|]*?) \| ([^|]+?) \|', sec.group(1), re.M):
                track, knife, cover, status = (x.strip() for x in m.groups())
                if track in ('轨',): continue
                st = status
                if 'nail' in st or '收官' in st: k = 'done'
                elif 'EXEC' in st or '落码' in st or '修复' in st: k = 'exec'
                elif '双审' in st or '席' in st: k = 'review'
                elif 'rev' in st or 'REQUEST' in st or '在途' in st: k = 'draft'
                elif '挂用户排期' in st: k = 'user'
                else: k = 'queue'
                knives.append({'track': track, 'knife': knife, 'cover': cover, 'status': st, 'k': k})
    except Exception:
        pass
    return batches, done, total, knives

def live():
    tip = git('rev-parse', '--short', 'HEAD') or '?'
    today = git('log', '--since=06:00', '--oneline').splitlines() if tip != '?' else []
    nail_today = sum(1 for l in today if 'nail' in l.lower() or l.startswith('* merge('))
    merges = [l for l in git('log', '--merges', '-6', '--format=%h %s').splitlines()]
    wt = git('worktree', 'list').count('\n') + 1 if tip != '?' else 0
    batches, done, total, knives = parse_ledger()
    pct = round(done * 100 / total) if total else 0
    return tip, nail_today, merges, wt, batches, done, total, pct, knives

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/data':
            try:
                base = json.load(open(S, encoding='utf-8'))
            except Exception:
                base = {}
            tip, nail_today, merges, wt, batches, done, total, pct, knives = live()
            base['tip'] = tip
            base['updatedAt'] = '实时（git+LEDGER 批表+刀位图）'
            base['live'] = {'nail_today': nail_today, 'merges': merges, 'worktrees': wt}
            base['stats'] = [
                {'k': '今日收口 commit', 'v': str(nail_today)},
                {'k': '271 条收口', 'v': str(done)},
                {'k': '战役刀位', 'v': str(len(knives))},
                {'k': '在飞席位', 'v': str(len(base.get('seats', [])))},
            ]
            if batches:
                base.setdefault('progress', {})['batches'] = batches
                base['progress']['done'] = done
                base['progress']['total'] = total
                base['progress']['pct'] = pct
            base['knives'] = knives
            out = json.dumps(base, ensure_ascii=False).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(out)))
            self.end_headers()
            self.wfile.write(out); return
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(HTML.encode())
    def log_message(self, *a): pass

HTML = """<!DOCTYPE html><html><head><meta charset="utf-8"><title>Meetwise 战役</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font:14px/1.5 -apple-system,'PingFang SC',sans-serif;background:#f6f8fa;color:#1f2328;padding:20px;max-width:1100px;margin:0 auto}
h1{font-size:18px;margin-bottom:4px}#ts{color:#1a7f37;font-size:12px;margin-bottom:16px}
h2{font-size:13px;color:#57606a;margin:18px 0 8px;text-transform:uppercase;letter-spacing:.5px}
.chain{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.c{border-radius:8px;padding:12px;border:1px solid #d0d7de;background:#ffffff}
.c .t{font-size:12px;color:#57606a}.c .n{font-size:15px;font-weight:600;margin:2px 0 6px}.c .e{font-size:11px;color:#57606a}
.done{border-color:#1a7f37}.done .n{color:#1a7f37}.fly{border-color:#bf8700}.fly .n{color:#9a6700}.todo{border-color:#cf222e}.todo .n{color:#cf222e}.wait{border-color:#8250df}.wait .n{color:#8250df}
.stats{display:flex;gap:24px;margin:6px 0;flex-wrap:wrap}
.s{font-size:22px;font-weight:700;color:#1f2328}.s small{display:block;font-size:11px;color:#57606a;font-weight:400}
table{width:100%;border-collapse:collapse;font-size:12px;background:#fff;border-radius:8px;overflow:hidden}
td,th{padding:5px 8px;border-bottom:1px solid #eaeef2;text-align:left}
th{color:#57606a;font-weight:500;font-size:11px;background:#f6f8fa}
.tag{padding:1px 7px;border-radius:10px;font-size:10px;font-weight:600}
.EXEC{background:#ddf4ff;color:#0969da}.REVIEW{background:#fbefff;color:#8250df}.NAIL{background:#dafbe1;color:#1a7f37}.DRAFT{background:#fff8c5;color:#9a6700}.VERIFY{background:#fbefff;color:#8250df}.SCOUT{background:#ddf4ff;color:#0969da}.EXPERT{background:#fbefff;color:#8250df}
.q li{margin:3px 0;color:#1f2328;font-size:12px;list-style:none;padding-left:14px;position:relative}
.q li:before{content:'▸';position:absolute;left:0;color:#cf222e}
.bar{height:22px;background:#eaeef2;border-radius:6px;overflow:hidden;position:relative;margin-bottom:4px}
.fill{height:100%;background:linear-gradient(90deg,#1a7f37,#2da44e);transition:width .5s}
.bar .lbl{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;text-shadow:0 1px 2px rgba(255,255,255,.4)}
.batch{display:flex;align-items:center;gap:10px;margin:5px 0;font-size:11px}
.batch .bn{width:90px;color:#57606a;flex-shrink:0}
.batch .bb{flex:1;height:10px;background:#eaeef2;border-radius:5px;overflow:hidden}
.batch .bf{height:100%;background:#2da44e}
.batch .bv{width:52px;color:#57606a;text-align:right;flex-shrink:0}
.live{font-size:11px;color:#57606a;margin:4px 0}
.live b{color:#1a7f37}
.kn{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.kcard{border:1px solid #d0d7de;background:#ffffff;border-radius:8px;padding:8px 10px}
.kcard .kt{font-size:10px;color:#57606a;text-transform:uppercase;letter-spacing:.5px}
.kcard .kn2{font-size:13px;font-weight:600;margin:1px 0 3px}
.kcard .kc{font-size:10px;color:#57606a;margin-bottom:4px;min-height:13px}
.kcard .ks{font-size:10px;color:#1f2328;line-height:1.35}
.k-done{border-color:#1a7f37}.k-done .kn2{color:#1a7f37}
.k-exec{border-color:#0969da}.k-exec .kn2{color:#0969da}
.k-review{border-color:#8250df}.k-review .kn2{color:#8250df}
.k-draft{border-color:#bf8700}.k-draft .kn2{color:#9a6700}
.k-queue{border-color:#d0d7de}.k-queue .kn2{color:#57606a}
.k-user{border-color:#cf222e}.k-user .kn2{color:#cf222e}
.track-h{grid-column:1/-1;font-size:11px;color:#57606a;margin:8px 0 0 2px;font-weight:600;letter-spacing:.5px}
</style></head><body>
<h1>⚡ Meetwise 战役仪表盘</h1><div id="ts"></div>
<h2>产品审计战役（271 条·LEDGER 批表权威）</h2><div class="bar"><div class="fill" id="pfill"></div><div class="lbl" id="plbl"></div></div>
<div id="batches"></div>
<div class="live" id="liverow"></div>
<h2>四门禁（北星·不变）</h2><div class="chain" id="chains"></div>
<h2>AG 修复+计费+安全 战役刀位图（LEDGER 实时）</h2><div class="kn" id="knives"></div>
<h2>战果（实时 git）</h2><div class="stats" id="stats"></div>
<h2>在飞席位（协调者维护）</h2><table id="seats"></table>
<h2>下一波队列</h2><ul class="q" id="queue"></ul>
<script>
function esc(s){return String(s).replace(/</g,'&lt;')}
fetch('/data').then(r=>r.json()).then(d=>{
document.getElementById('ts').textContent='数据时间 '+d.updatedAt+' · 主线 '+esc((d.tip||'').slice(0,8))+' · '+esc(d.campaign||'');
if(d.progress){const p=d.progress;
document.getElementById('pfill').style.width=p.pct+'%';
document.getElementById('plbl').textContent=p.done+' / '+p.total+' 已完成 = '+p.pct+'%';
document.getElementById('batches').innerHTML=(p.batches||[]).map(b=>'<div class="batch"><span class="bn">'+esc(b.n)+'</span><div class="bb"><div class="bf" style="width:'+(b.d*100/b.t)+'%"></div></div><span class="bv">'+b.d+'/'+b.t+'</span></div>').join('');}
document.getElementById('chains').innerHTML=d.chains.map(c=>'<div class="c '+c.s+'"><div class="t">'+esc(c.id)+'</div><div class="n">'+({done:'✅ 已通',fly:'🔄 在飞',todo:'📋 立项中',wait:'⏳ 等前置'})[c.s]+'</div><div class="e">'+esc(c.note)+'</div></div>').join('');
const KM={done:'✅',exec:'🔧',review:'🔍',draft:'✏️',queue:'⏳',user:'👤'};
let html='',lastTrack='';
(d.knives||[]).forEach(k=>{
if(k.track!==lastTrack){html+='<div class="track-h">'+esc(k.track)+'轨</div>';lastTrack=k.track;}
html+='<div class="kcard k-'+k.k+'"><div class="kt">'+esc(k.knife)+'</div><div class="kn2">'+KM[k.k]+' '+esc(k.knife)+'</div><div class="kc">'+esc(k.cover)+'</div><div class="ks">'+esc(k.status.length>90?k.status.slice(0,90)+'…':k.status)+'</div></div>';});
document.getElementById('knives').innerHTML=html||'<div style="color:#8b949e;font-size:12px">刀位图节待 LEDGER 写入</div>';
document.getElementById('stats').innerHTML=d.stats.map(s=>'<div class="s">'+esc(s.v)+'<small>'+esc(s.k)+'</small></div>').join('');
document.getElementById('seats').innerHTML='<tr><th>席位</th><th>类型</th><th>状态</th></tr>'+d.seats.map(s=>'<tr><td>'+esc(s.id)+'</td><td><span class="tag '+s.k+'">'+esc(s.k)+'</span></td><td style="color:#8b949e">'+esc(s.note)+'</td></tr>').join('');
document.getElementById('queue').innerHTML=d.queue.map(q=>'<li>'+esc(q)+'</li>').join('');
if(d.live){const L=d.live;
document.getElementById('liverow').innerHTML='实时 git：今日收口 commit <b>'+L.nail_today+'</b> · 最近 merge：<b>'+esc((L.merges[0]||'—').slice(0,60))+'</b> · worktree <b>'+L.worktrees+'</b>';}
});setInterval(()=>location.reload(),30000);
</script></body></html>"""

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", 8765), H) as s:
    s.serve_forever()
