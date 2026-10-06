DO $inj$
DECLARE r record; t0 timestamptz := clock_timestamp(); n0 bigint;
BEGIN
  SELECT count(*) INTO n0 FROM interview WHERE id LIKE 'IV\_P018\_R3\_%';
  RAISE NOTICE 'GATE_LOOP_START t0_ms=% iv_rows=%', floor(extract(epoch FROM t0) * 1000)::bigint, n0;
  LOOP
    PERFORM pg_stat_clear_snapshot();
    WITH iv AS (SELECT count(*) AS n, count(*) FILTER (WHERE status <> 'active') AS na
                  FROM interview WHERE id LIKE 'IV\_P018\_R3\_%'),
         idle AS (SELECT count(*) AS n FROM pg_stat_activity
                   WHERE datname = current_database() AND backend_type = 'client backend'
                     AND pid <> pg_backend_pid() AND state = 'idle'),
         tgt AS (SELECT pid, state, xact_start, left(query, 60) AS q FROM pg_stat_activity
                  WHERE datname = current_database() AND backend_type = 'client backend'
                    AND pid <> pg_backend_pid() AND state = 'idle in transaction'),
         k AS (SELECT t.pid, t.state, t.xact_start, t.q, pg_terminate_backend(t.pid) AS ok
                 FROM tgt t, iv WHERE iv.n BETWEEN 1 AND 109)
    SELECT (SELECT n FROM iv) AS iv_rows, (SELECT na FROM iv) AS iv_nonactive, (SELECT n FROM idle) AS idle_n,
           (SELECT count(*) FROM tgt) AS tgt_n, (SELECT count(*) FILTER (WHERE ok) FROM k) AS killed,
           (SELECT coalesce(json_agg(json_build_object('pid',pid,'state',state,'xact_start',xact_start,'q',q)),'[]') FROM k) AS snap
      INTO r;
    IF r.tgt_n >= 1 AND r.iv_rows BETWEEN 1 AND 109 THEN
      RAISE NOTICE 'INJECT_A phase=seed killed=% iv_rows=% iv_nonactive=% idle_n=% snap=%', r.killed, r.iv_rows, r.iv_nonactive, r.idle_n, r.snap; RETURN;
    ELSIF r.tgt_n >= 1 AND r.iv_rows = 110 AND r.iv_nonactive = 0 THEN
      RAISE NOTICE 'INJECT_PHASE_BOUNDARY iv_rows=% iv_nonactive=%', r.iv_rows, r.iv_nonactive; RETURN;
    ELSIF r.tgt_n >= 1 AND r.iv_rows = 110 AND r.iv_nonactive BETWEEN 1 AND 9 THEN
      RAISE NOTICE 'INJECT_PHASE_WARMUP iv_rows=% iv_nonactive=%', r.iv_rows, r.iv_nonactive; RETURN;
    ELSIF r.tgt_n >= 1 AND r.iv_rows = 110 THEN
      RAISE NOTICE 'INJECT_PHASE_MEASURED iv_rows=% iv_nonactive=%', r.iv_rows, r.iv_nonactive; RETURN;
    END IF;
    IF clock_timestamp() - t0 > interval '10 seconds' THEN
      RAISE NOTICE 'INJECT_GATE_TIMEOUT iv_rows=% idle_n=%', r.iv_rows, r.idle_n; RETURN;
    END IF;
    PERFORM pg_sleep(0.005);
  END LOOP;
END $inj$;
